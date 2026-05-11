pipeline {
  agent any

  environment {
    APP_PORT = '3000'
    DB_HOST = '10.171.32.3'
    DB_PORT = '5432'
    DB_NAME = 'appdb'
    DB_USER = 'appuser'
    DB_SSL = 'true'
    APP_VERSION = "jenkins-${BUILD_NUMBER}"
    ENVIRONMENT_NAME = 'Production'
  }

  stages {
    stage('Create Env File') {
      steps {
        withCredentials([string(credentialsId: 'db-password', variable: 'DB_PASSWORD')]) {
          sh '''
          cat > .env <<EOF
APP_PORT=$APP_PORT
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_SSL=$DB_SSL
APP_VERSION=$APP_VERSION
ENVIRONMENT_NAME=$ENVIRONMENT_NAME
EOF
          '''
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t customer-notes-app .'
      }
    }

    stage('Deploy Container') {
      steps {
        sh '''
        docker rm -f customer-notes-app || true

        docker run -d \
          --name customer-notes-app \
          --restart unless-stopped \
          -p 3000:3000 \
          --env-file .env \
          customer-notes-app
        '''
      }
    }

    stage('Health Check') {
      steps {
        sh 'curl http://localhost:3000/health'
      }
    }
  }
}
