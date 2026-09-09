import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.ts";
import todoRoutes from "./routes/todo.routes.ts";
import projectRoutes from "./routes/project.router.ts";
import notificationRoutes from "./routes/notification.routes.ts";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { startDueDateReminderJob } from "./jobs/dueDateReminder.job.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description: "TaskFlow backend API documentation",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log("The server was running", PORT);
});

startDueDateReminderJob();
