## EN
# Mangia Bene - Restaurant Management System
Welcome to the **Mangia Bene** project! This is a comprehensive restaurant management system designed to streamline operations for staff and enhance customer experience. The project is split into two main branches:

- **`main`**: Contains the Java-based backend service.
- **`web`**: Contains the React-based frontend application.
---
  ## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Contact](#contact)
---
## Overview
Mangia Bene is a dual-component system:
- **Backend (Java)**: Built with a robust server-side logic to manage reservations, orders, and staff shifts.
- **Frontend (React)**: A user-friendly interface for staff to book tables, manage orders, and view menus.

This project is ideal for restaurant owners looking to digitize their operations.

---
## Features
- **Backend (Java)**:
  - Manage table reservations and statuses.
  - Handle order processing and dish availability.
  - Track waiter shifts and schedules.
- **Frontend (React)**:
  - Intuitive staff dashboard for table booking.
  - Real-time order placement with quantity management.
  - Responsive design with a tiled background.

---

## Project Structure
```bash
MangiaBene/
├── client/              # React frontend (web branch)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── src/                # Java backend (main branch)
│   ├── java/
│   ├── resources/
│   └── ...
├── .gitignore
└── README.md
```

- **Branch `main`**: Java service code (IntelliJ IDEA project).
- **Branch `web`**: React application (WebStorm project) located in the `client` folder.

---

### Prerequisites
- **Java**: JDK 17 or higher (for backend).
- **Node.js**: v14.x or higher (for frontend).
- **Git**: For cloning the repository.

## Installation

### Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/funduruk/Restourant.git
   cd MangiaBene
   ```
2. **Switch to the Desired Branch**
   For java
   ```bash
   git checkout main
   ```
   For react
   ```bash
   git checkout web
   ```
3. **Install Dependencies**
   ### For Java (IntelliJ IDEA):
    Open the project in IntelliJ and let it download dependencies via Maven/Gradle.
   ### For React (WebStorm):
   ```bash
   npm install
   ```
4. **Configure Environment**
   Set up Supabase credentials in your environment variables or configuration files.
   Ensure a local database is running (e.g., via Supabase CLI).
## Usage
### Running the Backend (Java)
1. Open the project in IntelliJ IDEA.
2. Build and run the application.
### Running the Frontend (React)
1. Open the project in WebStorm
2. Start the development server:
   ```bash
   npm start
   ```
3. Open http://localhost:3000 in your browser.

## Contact
    Author: funduruk
    Email: dmitreydima000@gmail.com
    GitHub: https://github.com/funduruk/Restourant

## RU
# Mangia Bene — система управления рестораном
Добро пожаловать в проект **Mangia Bene**! Это комплексная система управления рестораном, разработанная для оптимизации работы персонала и улучшения обслуживания клиентов. Проект разделен на две основные ветви:

- **`main`**: Содержит бэкэнд-сервис на основе Java.
- **`web`**: Содержит фронтэнд-приложение на основе React.
---
## Содержание
- [Обзор](#overview-ru)
- [Функции](#features-ru)
- [Структура проекта](#project-structure-ru)
- [Установка](#installation-ru)
- [Использование](#usage-ru)
- [Контакты](#contact-ru)
---
## Обзор
Mangia Bene — это двухкомпонентная система:
- **Бэкэнд (Java)**: построена на надежной серверной логике для управления бронированием, заказами и сменами персонала.
- **Фронтенд (React)**: удобный интерфейс для персонала для бронирования столов, управления заказами и просмотра меню.

Этот проект идеально подходит для владельцев ресторанов, желающих оцифровать свои операции.
---
## Функции
- **Бэкэнд (Java)**:
- Управление бронированием столов и статусами.
- Управление обработкой заказов и доступностью блюд.
- Отслеживание смен и графиков работы официантов.
- **Фронтенд (React)**:
- Интуитивно понятная панель управления для персонала для бронирования столов.
- Размещение заказов в реальном времени с управлением количеством.
- Адаптивный дизайн с плиточным фоном.

---

## Структура проекта
```bash
MangiaBene/
├── client/              # React фронт-энд (web branch)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── src/                # Java бэк-энд (main branch)
│   ├── java/
│   ├── resources/
│   └── ...
├── .gitignore
└── README.md
```

- **Ветка `main`**: Код службы Java (проект IntelliJ IDEA).
- **Ветка `web`**: Приложение React (проект WebStorm), расположенное в папке `client`.

---

## Installation
### Предварительные условия
- **Java**: JDK 17 или выше (для бэкэнда).
- **Node.js**: v14.x или выше (для фронтэнда).
- **Git**: для клонирования репозитория.
### Steps
1. **Клонируйте репозиторий**
```bash
git clone https://github.com/funduruk/Restourant.git
cd MangiaBene
```
2. **Переключитесь на нужную ветку**

Для java
```bash
git checkout main
```
Для react
```bash
git checkout web
```
3. **Установите зависимости**

### Для Java (IntelliJ IDEA):
Откройте проект в IntelliJ и дайте ему загрузить зависимости через Maven/Gradle.
### Для React (WebStorm):
```bash
npm install
```
4. **Настройте среду**

Настройте учетные данные Supabase в переменных среды или файлах конфигурации.
## Использование
### Запуск бэкенда (Java)
1. Откройте проект в IntelliJ IDEA.
2. Соберите и запустите приложение.
### Запуск фронтенда (React)
1. Откройте проект в WebStorm
2. Запустите сервер разработки:
```bash
npm start
```
3. Откройте http://localhost:3000 в браузере.

## Контакты
Автор: funduruk
Электронная почта: dmitreydima000@gmail.com
GitHub: https://github.com/funduruk/Restourant
