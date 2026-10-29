pipeline {
    agent any

    parameters {
        booleanParam(name: 'PUBLISH_IMAGES', defaultValue: false, description: 'Build and publish Docker images after all tests pass (requires docker-hub credentials).')
        booleanParam(name: 'DEPLOY_DOCKER', defaultValue: false, description: 'Deploy to this Windows agent after all tests pass (requires Docker and BLMS secrets).')
    }

    tools {
        maven 'Maven-3.9.16'
        jdk 'JDK-21'
    }

    options {
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        REGISTRY_USER = 'esh22nika'
        IMAGE_TAG = "build-${BUILD_NUMBER}"
        BLMS_ADMIN_EMAIL = 'admin@blms.com'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Check Build Tools') {
            steps {
                script {
                    if (isUnix()) { error('This pipeline requires a Windows agent with Node.js and Chrome installed.') }
                }
                bat 'java -version'
                bat 'mvn -version'
                bat 'node --version'
                bat 'npm --version'
            }
        }
        stage('Backend Tests and Package') {
            steps {
                dir('backend') { bat 'mvn clean verify -B' }
            }
            post {
                always { junit testResults: 'backend/target/surefire-reports/TEST-com.blms.controller.*.xml,backend/target/surefire-reports/TEST-com.blms.service.*.xml', allowEmptyResults: true }
                success { archiveArtifacts artifacts: 'backend/target/blms-backend.jar', fingerprint: true }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm ci'
                    bat 'npm test'
                    bat 'npm run build'
                }
            }
            post { success { archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true } }
        }
        stage('Browser Tests') {
            steps {
                powershell '& .\\ci\\Test-Browser.ps1'
            }
            post {
                always {
                    junit testResults: 'backend/target/surefire-reports/TEST-com.blms.selenium.*.xml', allowEmptyResults: true
                    archiveArtifacts artifacts: 'backend/target/browser-*.log,backend/target/failure-screenshots/**', allowEmptyArchive: true
                }
            }
        }
        stage('Build Docker Images') {
            when { expression { params.PUBLISH_IMAGES || params.DEPLOY_DOCKER } }
            steps {
                bat 'docker build -t %REGISTRY_USER%/blms-backend:%IMAGE_TAG% ./backend'
                bat 'docker build -t %REGISTRY_USER%/blms-frontend:%IMAGE_TAG% ./frontend'
            }
        }
        stage('Publish Images') {
            when { expression { params.PUBLISH_IMAGES } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                    bat '''@echo off
powershell -NoProfile -Command "$env:DOCKER_PASSWORD | docker login --username $env:DOCKER_USER --password-stdin; exit $LASTEXITCODE"
if errorlevel 1 exit /b 1
docker push %REGISTRY_USER%/blms-backend:%IMAGE_TAG%
if errorlevel 1 exit /b 1
docker push %REGISTRY_USER%/blms-frontend:%IMAGE_TAG%
exit /b %ERRORLEVEL%
'''
                }
            }
        }
        stage('Deploy and Verify') {
            when { expression { params.DEPLOY_DOCKER } }
            steps {
                withCredentials([string(credentialsId: 'blms-db-password', variable: 'DB_PASSWORD'),
                                 string(credentialsId: 'blms-admin-password', variable: 'BLMS_ADMIN_PASSWORD')]) {
                    bat 'docker compose config --quiet'
                    bat 'docker compose up -d --no-build --remove-orphans --wait --wait-timeout 180'
                    bat 'curl --fail --retry 10 --retry-delay 3 --retry-connrefused http://localhost:3000/api/v1/health'
                    bat 'curl --fail http://localhost:3000/nginx-health'
                }
            }
        }
    }
    post {
        success { echo "Build ${IMAGE_TAG} passed backend, frontend and browser tests. Docker actions ran only if selected." }
        failure { echo 'Build or deployment verification failed. Check the failed stage.' }
        always { cleanWs() }
    }
}
