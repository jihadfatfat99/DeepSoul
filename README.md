# Threat Intelligence Dashboard

A real-time threat intelligence analytics platform that processes security data in batches using N8N workflow automation and provides interactive visualizations through a modern web interface.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

## Overview

The Threat Intelligence Dashboard is a comprehensive security analytics platform designed to process and visualize threat intelligence data in real-time. The system leverages N8N workflows for automated data processing and provides an intuitive frontend interface for monitoring and analysis.

### Key Components

- **Frontend**: React-based dashboard with real-time data visualization
- **Backend**: Node.js API server handling data processing and webhook callbacks
- **N8N Integration**: Automated workflow execution for batch processing

## Architecture

The application follows a microservices architecture with three main components:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │ ──────> │   Backend   │ ──────> │     N8N     │
│  Dashboard  │ <────── │   API       │ <────── │  Workflows  │
└─────────────┘         └─────────────┘         └─────────────┘
     :5173                   :3001                   
```

### Data Flow

1. User configures batch parameters (max-size, batch items) in the frontend
2. Frontend triggers the backend API to initiate N8N workflow
3. N8N processes data in batches
4. Each completed batch triggers a callback to the backend
5. Backend streams results to the frontend in real-time
6. Frontend updates visualizations progressively

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: v20.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **N8N**: Installed and configured with the required workflows

### Verify Installation

```bash
node --version
npm --version
```

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd threat-intelligence-dashboard
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
```

## Configuration

### Backend Configuration

The backend server runs on port `3001` by default. To modify this or other settings, update the configuration file in the backend directory.

### N8N Workflow Setup

1. Access your N8N instance at `http://localhost:5678` (or your configured URL)
2. Import the provided N8N workflows from the project repository
3. Configure webhook URLs to point to your backend server
4. Ensure workflows are activated

**Important**: Copy and paste the N8N workflows into your N8N instance before running the application.

### Frontend Configuration

The frontend expects the backend API to be available at `http://localhost:3001`. If you've configured a different backend URL, update the API endpoint in the frontend configuration.

## Usage

### Starting the Application

#### Step 1: Start the Backend Server

```bash
cd backend
npm start
```

The backend API will be available at: `http://localhost:3001`

#### Step 2: Start the Frontend Development Server

In a new terminal window:

```bash
cd frontend
npm run dev
```

The frontend dashboard will be available at: `http://localhost:5173`

**Important**: The backend must be running before starting the frontend to ensure proper API connectivity.

### Running Analytics

1. **Access the Dashboard**
   - Open your browser and navigate to `http://localhost:5173`

2. **Configure Batch Parameters**
   - Set the **max-size** parameter (maximum data points per batch)
   - Set the **batch items** parameter (number of items to process)

3. **Start Analytics**
   - Click the **"Start Analytics"** button
   - This triggers the N8N workflow to begin processing

4. **Monitor Progress**
   - View real-time updates as each batch completes
   - Progress bar indicates overall completion status
   - Data visualizations update automatically as results arrive

5. **Explore Results**
   - Navigate through different tabs to view various analytics
   - All tabs remain accessible during processing
   - Data persists after processing completes

## Features

### Real-Time Processing

- **Batch Processing**: Data is processed in configurable batches for optimal performance
- **Callback Mechanism**: Similar to WebSocket functionality, results stream to the frontend immediately upon batch completion
- **Progressive Updates**: Users can view partial results without waiting for complete processing

### Interactive Dashboard

- **Multi-Tab Interface**: Organized analytics across multiple tabs
- **Live Progress Tracking**: Visual progress bar shows processing status
- **Dynamic Visualizations**: Charts and graphs update in real-time

### Scalability

- **Configurable Batch Sizes**: Adjust processing parameters based on data volume
- **Asynchronous Processing**: Non-blocking architecture ensures responsive UI
- **Workflow Automation**: N8N integration enables complex data processing pipelines

## Troubleshooting

### Common Issues

**Backend Connection Failed**
- Ensure the backend server is running on port 3001
- Check for port conflicts with other applications
- Verify firewall settings allow localhost connections

**Frontend Cannot Connect to Backend**
- Confirm backend is started before frontend
- Check browser console for CORS or network errors
- Verify API endpoint configuration in frontend

**N8N Workflow Not Triggering**
- Ensure N8N workflows are properly imported and activated
- Verify webhook URLs are correctly configured
- Check N8N logs for execution errors

**No Data Appearing in Dashboard**
- Confirm batch parameters are set correctly
- Check backend logs for callback errors
- Verify N8N workflow is processing data successfully

### Logs and Debugging

- **Backend Logs**: Available in the terminal where `npm start` was executed
- **Frontend Console**: Open browser DevTools (F12) to view console logs
- **N8N Execution Logs**: Available in the N8N workflow execution panel

## API Endpoints

### Backend API

- `POST /trigger-analytics` - Initiates N8N workflow execution
- `POST /callback` - Receives batch completion callbacks from N8N
- `GET /status` - Returns current processing status

## Development

### Running in Development Mode

Both frontend and backend support development mode with hot-reloading:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

## License

[Specify your license here]

## Support

For issues, questions, or contributions, please [specify contact method or repository issues page].

---

**Note**: This application requires both the frontend and backend servers to run simultaneously. Ensure proper network connectivity between all components for optimal performance.