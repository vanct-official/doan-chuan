const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Back-end API Documentation",
      version: "1.0.0",
      description: "API documentation for the back-end application",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT Bearer token authentication. Include the token in the Authorization header.",
        },
      },
      schemas: {
        // Common response schemas
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
            },
            data: {
              type: "object",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                  },
                  message: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Retrieved successfully",
            },
            data: {
              type: "array",
              items: {
                type: "object",
              },
            },
            pagination: {
              type: "object",
              properties: {
                page: {
                  type: "integer",
                  example: 1,
                },
                pageSize: {
                  type: "integer",
                  example: 10,
                },
                total: {
                  type: "integer",
                  example: 100,
                },
                totalPages: {
                  type: "integer",
                  example: 10,
                },
              },
            },
          },
        },
        // Viết các schema cụ thể cho từng model ở đây, ví dụ User, Product, Order, v.v.
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64d2bd50f1464b001a123abc" },
            name: { type: "string", example: "Nguyễn Văn A" },
            phone: { type: "string", example: "0123456789" },
            email: { type: "string", example: "user@example.com" },
            dob: { type: "string", format: "date-time" },
            gender: { type: "string", enum: ["Male", "Female", "Other"] },
          },
        },
        Tour: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64d2bd50f1464b001a123def" },
            name: { type: "string", example: "Đà Lạt 3 Ngày 2 Đêm" },
            start_time: { type: "string", format: "date-time" },
            end_time: { type: "string", format: "date-time" },
            deadline: { type: "string", format: "date-time" },
            max_capacity: { type: "integer", example: 45 },
            created_by: { type: "string", example: "64d2bd50f1464b001a123abc" },
            leader_id: { type: "string", example: "64d2bd50f1464b001a123abc" },
            status: {
              type: "string",
              enum: ["draft", "confirmed", "completed"],
              default: "draft",
            },
          },
        },
        Membership: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64d2bd50f1464b001a123ghi" },
            tour_id: { type: "string" },
            user_id: { type: "string", nullable: true },
            guest_info: {
              type: "object",
              properties: {
                name: { type: "string" },
                phone: { type: "string" },
              },
            },
            role: {
              type: "string",
              enum: ["leader", "group_rep", "vehicle_rep", "driver", "member"],
            },
            status: {
              type: "string",
              enum: ["pending", "approved", "rejected", "removed", "left"],
            },
            group_id: { type: "string", nullable: true },
            vehicle_id: { type: "string", nullable: true },
            note: { type: "string" },
            leave_reason: { type: "string" },
          },
        },
        Vehicle: {
          type: "object",
          properties: {
            _id: { type: "string" },
            tour_id: { type: "string" },
            license_plate: { type: "string", example: "51F-12345" },
            seat_count: { type: "integer", example: 45 },
          },
        },
      },
      responses: {
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        Unauthorized: {
          description: "Unauthorized - Missing or invalid token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        Forbidden: {
          description: "Forbidden - Insufficient permissions",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        BadRequest: {
          description: "Bad Request - Validation failed",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],

  apis: ["./server.js", "./routes/*.js", "./controllers/*.js", "./model/*.js"],
};
module.exports = swaggerOptions;
