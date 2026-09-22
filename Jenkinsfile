pipeline {
    agent any

    tools {
        maven 'Maven-3.9.16'
        jdk 'JDK-21'
    }

    environment {
        BACKEND_DIR  = 'backend'
        FRONTEND_DIR = 'frontend'
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
                    bat 'mvn test -Dtest="!com.blms.selenium.*"'
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
                dir("${BACKEND_DIR}") {
                    bat 'mvn test -Dtest="com.blms.selenium.*" -DfailIfNoTests=false'
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

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying backend JAR...'
                dir("${BACKEND_DIR}") {
                    bat 'copy target\\blms-backend.jar ..\\deploy\\blms-backend.jar'
                }
                echo 'Deploying frontend build...'
                dir("${FRONTEND_DIR}") {
                    bat 'xcopy /E /Y dist ..\\deploy\\frontend\\'
                }
                echo 'Deployment complete.'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
        }
        always {
            cleanWs()
        }
    }
}
