pipeline {
  agent any

  environment {
    PROJECT_ID = 'project-2a4104fb-d065-46a4-8a3'
    REGION = 'us-central1'
    GAR_REPO = 'customer-notes-repo'
    IMAGE_NAME = 'customer-notes-app'
    IMAGE_TAG = "jenkins-${BUILD_NUMBER}"
    IMAGE_URI = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${GAR_REPO}/${IMAGE_NAME}:${IMAGE_TAG}"
  }

  stages {

    stage('Build Docker Image') {
      steps {
        sh '''
        echo "Building image: $IMAGE_URI"
        docker build -t $IMAGE_URI .
        '''
      }
    }

    stage('Push Image to Artifact Registry') {
      steps {
        sh '''
        echo "Pushing image to Artifact Registry..."
        docker push $IMAGE_URI
        '''
      }
    }

    stage('Update Kubernetes Manifest') {
      steps {
        sh '''
        echo "Updating k8s/deployment.yaml with new image tag..."

        sed -i "s|image: .*customer-notes-app:.*|image: $IMAGE_URI|" k8s/deployment.yaml

        git config user.email "jenkins@vm-lab1.local"
        git config user.name "Jenkins CI"

        git add k8s/deployment.yaml
        git commit -m "Update Kubernetes image to $IMAGE_TAG" || echo "No changes to commit"

        git pull --rebase origin main
        git push origin main
        '''
      }
    }
  }
}
