# IronPulse: The Ultimate Gym Performance Tracker

IronPulse is a high-performance, mobile-first workout tracking application built for serious athletes. It combines real-time logging, advanced physiological tracking, and AI-driven insights to optimize training volume and strength progression.

## 🚀 Key Features

- **Dynamic Workout Logging**: Real-time tracking of sets, weights, and reps with an integrated rest timer and session clock.
- **AI Smart Insights**: Automated analysis of training volume distribution across muscle groups, offering intelligent exercise recommendations to prevent plateauing.
- **Advanced Strength Analytics**: Automatic **1-Rep Max (1RM)** estimation based on historical performance using the Epley formula.
- **Physical Transformation Log**: Track body metrics (weight, temperature) and maintain a visual photo gallery of your progress.
- **Cloud Connectivity**: Secure, real-time data persistence powered by **Firebase Firestore** and Anonymous Authentication.
- **Social Integration**: One-tap performance sharing for social media and messaging.

## 🛠 Tech Stack

- **Frontend**: React Native with [Expo](https://expo.dev/) (SDK 52+)
- **Navigation**: Expo Router (File-based routing)
- **Backend**: Firebase Firestore (NoSQL Database) & Firebase Auth
- **Icons**: Lucide React Native
- **Styling**: Premium Dark-UI theme with custom design tokens

## 📦 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workout-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   Update `services/firebase.ts` with your unique Firebase configuration keys.

4. **Launch the Development Server**
   ```bash
   npx expo start
   ```

## 🧠 AI Strategy: Gap Analysis

IronPulse employs a "Gap Analysis" algorithm that:
1. Iterates through the your most recent workout logs (last 10 sessions).
2. Categorizes training volume by muscle group.
3. Identifies the "Under-Trained" zones.
4. Recommends targeted movements from the IronPulse library to ensure balanced physiological development.

---

*Developed as a Final Project for XAMK: AI in Practice.*
