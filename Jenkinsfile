pipeline {
  agent any
  stages {
    stage('Install') {
      steps {
        sh 'npm install'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Build Docker') {
      steps {
        sh 'docker compose build'
      }
    }
    stage('Deploy') {
      steps {
        // comandos de deploy, se necessário
      }
    }
  }
}
