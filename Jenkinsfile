pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "praveenmethraskar/zibomo"
    }
    stages {
        stage('Clone Repository') {
            steps {
              git 'https://github.com/praveenmethraskar/zibomo_facial.git'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_IMAGE:latest .'
                }
            }
        }
        stage('Push to Docker Hub') {
            steps {
                script {
                    withDockerRegistry([credentialsId: 'docker-hub', url: 'https://index.docker.io/v1/']) {
                        sh 'docker push $DOCKER_IMAGE:latest'
                    }
                }
            }
        }
        stage('Deploy with Docker Compose') {
            steps {
                script {
                    sh 'docker-compose up -d'
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline completed.'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
