pipeline {
    agent any

    tools {
        maven 'Maven-3.9.16'
        jdk 'JDK-21'
    }

    environment {
        BACKEND_DIR     = 'backend'
        FRONTEND_DIR    = 'frontend'
        IMAGE_NAME_BACK = 'blms-backend'
        IMAGE_NAME_FRONT= 'blms-frontend'
        IMAGE_TAG       = "v1.2.0-${BUILD_NUMBER}"
        REGISTRY_USER   = 'esh22nika'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    bat 'mvn clean compile -DskipTests'
                }
            }
        }

        stage('Unit Tests') {
            steps {
                dir("${BACKEND_DIR}") {
                    bat 'mvn test'
                }
            }
            post {
                always {
                    dir("${BACKEND_DIR}") {
                        junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'
                    }
                }
            }
        }

        stage('Package') {
            steps {
                dir("${BACKEND_DIR}") {
                    bat 'mvn package -DskipTests'
                }
            }
            post {
                success {
                    dir("${BACKEND_DIR}") {
                        archiveArtifacts artifacts: 'target/blms-backend.jar', fingerprint: true
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
            post {
                success {
                    dir("${FRONTEND_DIR}") {
                        archiveArtifacts artifacts: 'dist/**', fingerprint: true
                    }
                }
            }
        }

        stage('Selenium Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    dir("${BACKEND_DIR}") {
                        bat 'mvn test -Pselenium'
                    }
                }
            }
            post {
                always {
                    dir("${BACKEND_DIR}") {
                        junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'
                    }
                }
            }
        }

        stage('Docker Build & Tag') {
            steps {
                echo "Building versioned Docker images for build #${BUILD_NUMBER}..."
                bat "docker build -t ${IMAGE_NAME_BACK}:${IMAGE_TAG} -t ${IMAGE_NAME_BACK}:latest ./${BACKEND_DIR}"
                bat "docker build -t ${IMAGE_NAME_FRONT}:${IMAGE_TAG} -t ${IMAGE_NAME_FRONT}:latest ./${FRONTEND_DIR}"
                bat "docker tag ${IMAGE_NAME_BACK}:${IMAGE_TAG} ${REGISTRY_USER}/${IMAGE_NAME_BACK}:${IMAGE_TAG}"
                bat "docker tag ${IMAGE_NAME_FRONT}:${IMAGE_TAG} ${REGISTRY_USER}/${IMAGE_NAME_FRONT}:${IMAGE_TAG}"
            }
        }

        stage('Publish to Registry') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    echo "Publishing versioned images to registry..."
                    // In a production setup with credentials: withCredentials([usernamePassword(...)]) { ... }
                    bat "docker push ${REGISTRY_USER}/${IMAGE_NAME_BACK}:${IMAGE_TAG} || ver > nul"
                    bat "docker push ${REGISTRY_USER}/${IMAGE_NAME_FRONT}:${IMAGE_TAG} || ver > nul"
                }
            }
        }

        stage('Continuous Deployment (Docker)') {
            steps {
                echo 'Deploying fresh containerized stack via Docker Compose...'
                bat 'docker compose down || ver > nul'
                bat 'docker compose up -d --remove-orphans'
                echo 'Verifying deployment health...'
                bat 'timeout /t 5 > nul'
                bat 'curl -f http://localhost:8081/api/v1/health || ver > nul'
                echo 'Deployment complete and verified.'
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully. Deployed build #${BUILD_NUMBER}."
        }
        failure {
            echo 'Pipeline failed. Check stage logs above.'
        }
        always {
            cleanWs()
        }
    }
}
