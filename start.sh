#!/bin/bash
cd backend
./mvnw package -DskipTests
java -jar target/*.jar