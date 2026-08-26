pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        APP_NAME = 'iwa-nodejs'
        FOD_URL = 'https://ams.fortify.com'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Install') {
            steps { sh 'npm ci' }
        }

        stage('Build') {
            steps { sh 'npm run build' }
        }

        stage('Test') {
            steps { sh 'npm test' }
        }

        stage('Fortify ScanCentral SAST') {
            when { branch 'main' }
            steps {
                withCredentials([string(credentialsId: 'SC_SAST_TOKEN', variable: 'SC_SAST_TOKEN')]) {
                    sh './bin/scancentral-sast-scan.sh'
                }
            }
        }

        stage('Debricked SCA') {
            when { branch 'main' }
            steps {
                withCredentials([string(credentialsId: 'DEBRICKED_TOKEN', variable: 'DEBRICKED_TOKEN')]) {
                    sh './bin/debricked-scan.sh'
                }
            }
        }

        stage('Docker Build') {
            steps { sh 'docker build -t ${APP_NAME}:${BUILD_NUMBER} .' }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'test-results/*.xml'
        }
    }
}
