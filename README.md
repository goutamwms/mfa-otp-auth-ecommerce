# Auth MFA System

A full-stack authentication system with Multi-Factor Authentication (MFA) using OTP verification.

## Tech Stack

- **Server**: Node.js, Express, TypeScript, Postgres
- **Client**: React, TypeScript, Tailwind CSS, Zustand, React query
- **Email**: Ethereal Email (test emails)

## Features

- User registration and login
- OTP verification via email
- Rate limiting for security
- User and Admin dashboards
- Admin sidebar with navigation
- User management (admin only)
- Design Pattern
- Ecommerce (WIP)

# Server Folder Structure

```
server/src/
├── index.ts
├── application/
│   ├── dtos/
│   │   ├── request/
│   │   │   ├── AuthDtos.ts
│   │   │   ├── CategoryDtos.ts
│   │   │   ├── ColorDtos.ts
│   │   │   ├── ProductDtos.ts
│   │   │   ├── UserDtos.ts
│   │   │   └── index.ts
│   │   └── response/
│   │       ├── AuthResponses.ts
│   │       ├── CategoryResponses.ts
│   │       ├── ColorResponses.ts
│   │       ├── ProductResponses.ts
│   │       └── index.ts
│   └── services/
│       ├── AuthService.ts
│       ├── UserService.ts
│       ├── index.ts
│       └── ecommerce/
│           ├── CategoryService.ts
│           ├── ColorService.ts
│           ├── ProductService.ts
│           └── index.ts
├── config/
│   ├── database.ts
│   └── DependencyInjection.ts
├── domain/
│   ├── entities/
│   │   ├── User.ts
│   │   ├── index.ts
│   │   └── ecommerce/
│   │       ├── Category.ts
│   │       ├── Color.ts
│   │       ├── Product.ts
│   │       ├── ProductImage.ts
│   │       ├── Tag.ts
│   │       ├── Translation.ts
│   │       └── index.ts
│   ├── errors/
│   │   ├── AppError.ts
│   │   └── index.ts
│   └── interfaces/
│       ├── ICategoryRepository.ts
│       ├── IColorRepository.ts
│       ├── IProductRepository.ts
│       ├── IServices.ts
│       ├── ITagRepository.ts
│       ├── IUserRepository.ts
│       └── index.ts
├── infrastructure/
│   ├── database/
│   │   ├── Database.ts
│   │   └── index.ts
│   ├── repositories/
│   │   ├── CategoryRepository.ts
│   │   ├── ColorRepository.ts
│   │   ├── ProductRepository.ts
│   │   ├── TagRepository.ts
│   │   ├── UserRepository.ts
│   │   └── index.ts
│   └── services/
│       ├── EmailService.ts
│       ├── OtpGenerator.ts
│       ├── TokenService.ts
│       └── index.ts
├── models/
│   └── user.ts
├── presentation/
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── UserController.ts
│   │   ├── index.ts
│   │   └── ecommerce/
│   │       ├── CategoryController.ts
│   │       ├── ColorController.ts
│   │       ├── ProductController.ts
│   │       └── index.ts
│   ├── middleware/
│   │   ├── AuthMiddleware.ts
│   │   ├── ErrorHandler.ts
│   │   ├── RateLimiter.ts
│   │   └── index.ts
│   └── routes/
│       ├── adminRoutes.ts
│       ├── authRoutes.ts
│       └── index.ts
├── routes/
│   └── ecommerce/
│       ├── adminColorRoutes.ts
│       ├── adminProductRoutes.ts
│       ├── categoryRoutes.ts
│       ├── colorRoutes.ts
│       ├── index.ts
│       └── productRoutes.ts
├── shared/
│   ├── decorators/
│   └── utils/
│       ├── Result.ts
│       ├── Validator.ts
│       └── index.ts
└── types/
    └── index.ts
```

## Architecture Overview

This project follows **Clean Architecture** principles with the following layers:

### 1. Domain Layer (`domain/`)
- **Entities**: Core business objects (User, Category, Product, Color, Tag, etc.)
- **Interfaces**: Repository contracts defining data access methods
- **Errors**: Custom error classes for application-specific errors

### 2. Application Layer (`application/`)
- **Services**: Business logic implementations (AuthService, UserService, CategoryService, etc.)
- **DTOs**: Data Transfer Objects for request validation and response formatting

### 3. Infrastructure Layer (`infrastructure/`)
- **Repositories**: Database implementations of repository interfaces
- **Services**: External service integrations (Email, Token generation)
- **Database**: PostgreSQL connection and query utilities

### 4. Presentation Layer (`presentation/`)
- **Controllers**: Request handling and response formatting
- **Middleware**: Authentication, error handling, rate limiting
- **Routes**: API endpoint definitions

## Clean Architecture Principles

1. **Independence of layers**: Inner layers don't depend on outer layers
2. **Dependency Injection**: Services and repositories are injected via DI container
3. **Separation of Concerns**: Each layer has a single responsibility
4. **Testability**: Business logic in services can be easily unit tested

## Screenshot

![otp verify](https://github.com/user-attachments/assets/9ab44eb4-eda1-4549-878a-24b7d3100511)
