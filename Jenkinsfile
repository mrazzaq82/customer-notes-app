pipeline { 

  agent any 

  stages { 

    stage('Checkout') { 

      steps { 

        git branch: 'main', url: 'git@github.com:mrazzaq82/customer-notes-app.git' 

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

        docker run -d --name customer-notes-app --restart unless-stopped -p 3000:3000 --env-file .env customer-notes-app 

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
