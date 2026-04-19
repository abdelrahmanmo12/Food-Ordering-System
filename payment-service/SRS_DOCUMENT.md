# Software Requirements Specification (SRS)
## Payment Service

**Version:** 1.0  
**Date:** April 2026  
**Team Size:** 6-7 members  

---

## 1. Introduction

### 1.1 Purpose
This document describes the software requirements for the Payment Service, a microservice component of the Food Ordering System. The Payment Service is responsible for processing payments, managing payment transactions, handling refunds, and providing payment-related APIs to other services in the system.

### 1.2 Scope
The Payment Service provides:
- Payment processing for orders
- Payment status tracking
- Refund processing
- Payment history retrieval
- Role-based access control for payment operations
- Integration with service discovery (Eureka)
- AOP-based logging and security monitoring

### 1.3 Definitions, Acronyms, Abbreviations
- **API**: Application Programming Interface
- **AOP**: Aspect-Oriented Programming
- **DTO**: Data Transfer Object
- **JPA**: Java Persistence API
- **REST**: Representational State Transfer
- **SRS**: Software Requirements Specification

### 1.4 References
- Spring Boot Documentation
- Spring Cloud Documentation
- Microservices Architecture Patterns

### 1.5 Overview
This document includes:
- Overall description of the system
- Specific requirements
- Use case diagrams
- Class diagrams
- Sequence diagrams
- Activity diagrams

---

## 2. Overall Description

### 2.1 Product Perspective
The Payment Service is a microservice within the larger Food Ordering System. It communicates with:
- **Order Service**: Receives payment requests for orders
- **User Service**: Validates user information
- **Discovery Server**: Registers itself for service discovery
- **API Gateway**: Routes external requests to the payment service
- **Database**: Stores payment transactions

### 2.2 Product Functions
- Process payments for orders
- Track payment status (PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED)
- Process refunds for completed payments
- Retrieve payment history by order, user, or status
- Cancel pending payments
- Provide role-based access control (ADMIN, EMPLOYEE, CUSTOMER)

### 2.3 User Characteristics
- **Admin**: Full access to all payment operations and administrative functions
- **Employee**: Can process payments and refunds, view payment history
- **Customer**: Can make payments, cancel own payments, view own payment history

### 2.4 Constraints
- Must use Spring Boot framework
- Must implement REST APIs
- Must use microservices architecture with Spring Cloud
- Must implement AOP for logging and security
- Must be containerized with Docker
- Must support role-based authorization
- Must integrate with Eureka service discovery

### 2.5 Assumptions and Dependencies
- MySQL database is available
- Eureka discovery server is running
- User authentication is handled by Auth Service
- Network connectivity between services is reliable

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### FR1: Payment Processing
- **FR1.1**: The system shall accept payment requests with order ID, user ID, amount, and payment method
- **FR1.2**: The system shall generate a unique payment ID for each payment
- **FR1.3**: The system shall process payments and update status to COMPLETED or FAILED
- **FR1.4**: The system shall generate a transaction ID for successful payments

#### FR2: Payment Retrieval
- **FR2.1**: The system shall allow retrieval of payment by payment ID
- **FR2.2**: The system shall allow retrieval of all payments for a specific order
- **FR2.3**: The system shall allow retrieval of all payments for a specific user
- **FR2.4**: The system shall allow retrieval of payments by status (Admin only)

#### FR3: Refund Processing
- **FR3.1**: The system shall allow refund processing for completed payments
- **FR3.2**: The system shall validate that payment is completed before refunding
- **FR3.3**: The system shall update payment status to REFUNDED after successful refund

#### FR4: Payment Cancellation
- **FR4.1**: The system shall allow cancellation of pending payments
- **FR4.2**: The system shall prevent cancellation of completed payments

#### FR5: Security and Authorization
- **FR5.1**: The system shall require authentication for all API endpoints
- **FR5.2**: The system shall implement role-based access control
- **FR5.3**: The system shall log all payment operations with user information

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- The system shall process payment requests within 2 seconds
- The system shall support at least 100 concurrent payment requests

#### NFR2: Reliability
- The system shall have 99.9% uptime
- The system shall handle payment failures gracefully

#### NFR3: Security
- The system shall encrypt sensitive payment information
- The system shall implement HTTPS for all communications
- The system shall audit all payment operations

#### NFR4: Scalability
- The system shall be horizontally scalable
- The system shall handle increased load through containerization

#### NFR5: Maintainability
- The system shall follow clean architecture principles
- The system shall have comprehensive logging
- The system shall have clear separation of concerns

---

## 4. Use Case Diagram

### 4.1 Actors
- **Admin**: System administrator with full access
- **Employee**: Restaurant employee with payment processing capabilities
- **Customer**: End user who makes payments
- **Payment System**: External payment gateway (simulated)

### 4.2 Use Cases

#### UC1: Create Payment
- **Actor**: Customer, Employee, Admin
- **Description**: Create a new payment for an order
- **Precondition**: User is authenticated, order exists
- **Postcondition**: Payment is created with PENDING status, then processed
- **Main Flow**:
  1. User submits payment request
  2. System validates payment details
  3. System processes payment
  4. System updates payment status
  5. System returns payment response

#### UC2: Process Refund
- **Actor**: Employee, Admin
- **Description**: Process a refund for a completed payment
- **Precondition**: Payment exists and is in COMPLETED status
- **Postcondition**: Payment status is updated to REFUNDED
- **Main Flow**:
  1. User submits refund request
  2. System validates payment status
  3. System processes refund
  4. System updates payment status
  5. System returns refund confirmation

#### UC3: View Payment Details
- **Actor**: Customer, Employee, Admin
- **Description**: View details of a specific payment
- **Precondition**: Payment exists, user has access rights
- **Postcondition**: Payment details are displayed
- **Main Flow**:
  1. User requests payment details
  2. System retrieves payment information
  3. System returns payment details

#### UC4: View Payment History
- **Actor**: Customer, Employee, Admin
- **Description**: View payment history for a user or order
- **Precondition**: User is authenticated
- **Postcondition**: Payment history is displayed
- **Main Flow**:
  1. User requests payment history
  2. System retrieves payment records
  3. System returns payment history

#### UC5: Cancel Payment
- **Actor**: Customer, Employee, Admin
- **Description**: Cancel a pending payment
- **Precondition**: Payment exists and is in PENDING status
- **Postcondition**: Payment status is updated to CANCELLED
- **Main Flow**:
  1. User requests payment cancellation
  2. System validates payment status
  3. System cancels payment
  4. System returns cancellation confirmation

---

## 5. Class Diagram

### 5.1 Core Classes

```
┌─────────────────────────────┐
│       Payment              │
├─────────────────────────────┤
│ - id: Long                  │
│ - paymentId: String         │
│ - orderId: Long             │
│ - userId: Long              │
│ - amount: BigDecimal        │
│ - status: PaymentStatus    │
│ - paymentMethod: PaymentMethod │
│ - transactionId: String    │
│ - description: String       │
│ - createdAt: LocalDateTime  │
│ - updatedAt: LocalDateTime  │
├─────────────────────────────┤
│ + getPaymentId(): String    │
│ + getOrderId(): Long        │
│ + getUserId(): Long         │
│ + getAmount(): BigDecimal   │
│ + getStatus(): PaymentStatus│
│ + getPaymentMethod(): PaymentMethod│
└─────────────────────────────┘
         │
         │
         ▼
┌─────────────────────────────┐
│   PaymentStatus (Enum)      │
├─────────────────────────────┤
│ PENDING                     │
│ COMPLETED                   │
│ FAILED                      │
│ REFUNDED                    │
│ CANCELLED                   │
└─────────────────────────────┘

┌─────────────────────────────┐
│   PaymentMethod (Enum)      │
├─────────────────────────────┤
│ CREDIT_CARD                 │
│ DEBIT_CARD                  │
│ PAYPAL                      │
│ CASH_ON_DELIVERY            │
│ BANK_TRANSFER               │
└─────────────────────────────┘

┌─────────────────────────────┐
│    PaymentRepository        │
├─────────────────────────────┤
│ + findByPaymentId(String)   │
│ + findByOrderId(Long)       │
│ + findByUserId(Long)        │
│ + findByStatus(PaymentStatus)│
│ + save(Payment)             │
└─────────────────────────────┘

┌─────────────────────────────┐
│    PaymentService           │
├─────────────────────────────┤
│ - paymentRepository         │
│ - paymentMapper             │
├─────────────────────────────┤
│ + createPayment(Request)    │
│ + processRefund(Request)    │
│ + getPaymentByPaymentId(String)│
│ + getPaymentsByOrderId(Long)│
│ + getPaymentsByUserId(Long)│
│ + cancelPayment(String)     │
└─────────────────────────────┘

┌─────────────────────────────┐
│    PaymentController        │
├─────────────────────────────┤
│ - paymentService            │
├─────────────────────────────┤
│ + createPayment()           │
│ + getPaymentByPaymentId()   │
│ + getPaymentsByOrderId()    │
│ + getPaymentsByUserId()     │
│ + processRefund()           │
│ + cancelPayment()           │
└─────────────────────────────┘

┌─────────────────────────────┐
│    PaymentRequest (DTO)     │
├─────────────────────────────┤
│ - orderId: Long             │
│ - userId: Long              │
│ - amount: BigDecimal        │
│ - paymentMethod: PaymentMethod│
│ - description: String       │
└─────────────────────────────┘

┌─────────────────────────────┐
│   PaymentResponse (DTO)     │
├─────────────────────────────┤
│ - id: Long                  │
│ - paymentId: String         │
│ - orderId: Long             │
│ - userId: Long              │
│ - amount: BigDecimal        │
│ - status: PaymentStatus    │
│ - paymentMethod: PaymentMethod│
│ - transactionId: String    │
│ - createdAt: LocalDateTime  │
│ - updatedAt: LocalDateTime  │
└─────────────────────────────┘
```

---

## 6. Sequence Diagram

### 6.1 Create Payment Sequence

```
Customer      PaymentController    PaymentService    PaymentRepository    PaymentGateway
   │                 │                   │                  │                  │
   │ POST /api/payments                  │                  │                  │
   ├────────────────>│                   │                  │                  │
   │                 │                   │                  │                  │
   │                 │ createPayment()    │                  │                  │
   │                 ├──────────────────>│                  │                  │
   │                 │                   │                  │                  │
   │                 │                   │ toEntity()       │                  │
   │                 │                   ├────────────────>│                  │
   │                 │                   │                  │                  │
   │                 │                   │ processPayment() │                  │
   │                 │                   │                  │                  │
   │                 │                   │                  │ Process Payment  │
   │                 │                   │                  ├────────────────>│
   │                 │                   │                  │                  │
   │                 │                   │                  │ Success/Failure  │
   │                 │                   │                  │<────────────────│
   │                 │                   │                  │                  │
   │                 │                   │ save()           │                  │
   │                 │                   ├────────────────>│                  │
   │                 │                   │                  │                  │
   │                 │                   │ PaymentResponse  │                  │
   │                 │                   │<────────────────│                  │
   │                 │                   │                  │                  │
   │                 │ PaymentResponse    │                  │                  │
   │                 │<──────────────────│                  │                  │
   │                 │                   │                  │                  │
   │ PaymentResponse │                   │                  │                  │
   │<────────────────│                   │                  │                  │
```

### 6.2 Process Refund Sequence

```
Employee      PaymentController    PaymentService    PaymentRepository
   │                 │                   │                  │
   │ POST /api/payments/refund          │                  │
   ├────────────────>│                   │                  │
   │                 │                   │                  │
   │                 │ processRefund()   │                  │
   │                 ├──────────────────>│                  │
   │                 │                   │                  │
   │                 │                   │ findByPaymentId()│
   │                 │                   ├────────────────>│
   │                 │                   │                  │
   │                 │                   │ Payment          │
   │                 │                   │<────────────────│
   │                 │                   │                  │
   │                 │                   │ validateStatus() │
   │                 │                   │                  │
   │                 │                   │ updateStatus()   │
   │                 │                   ├────────────────>│
   │                 │                   │                  │
   │                 │                   │ PaymentResponse  │
   │                 │                   │<────────────────│
   │                 │                   │                  │
   │                 │ PaymentResponse   │                  │
   │                 │<──────────────────│                  │
   │                 │                   │                  │
   │ PaymentResponse │                   │                  │
   │<────────────────│                   │                  │
```

---

## 7. Activity Diagram

### 7.1 Create Payment Activity

```
                    [Start]
                        │
                        ▼
            ┌───────────────────────┐
            │ Receive Payment Request│
            └───────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │ Validate Request Data │
            └───────────────────────┘
                        │
               ┌────────┴────────┐
               │                 │
               ▼                 ▼
          [Valid]            [Invalid]
               │                 │
               ▼                 ▼
    ┌──────────────────┐  ┌──────────────┐
    │ Create Payment   │  │ Return Error │
    │ Entity           │  └──────────────┘
    └──────────────────┘
               │
               ▼
    ┌──────────────────┐
    │ Process Payment  │
    └──────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
  [Success]       [Failure]
       │               │
       ▼               ▼
┌─────────────┐  ┌──────────────┐
│ Set Status  │  │ Set Status   │
│ COMPLETED   │  │ FAILED       │
└─────────────┘  └──────────────┘
       │               │
       └───────┬───────┘
               ▼
    ┌──────────────────┐
    │ Save Payment     │
    └──────────────────┘
               │
               ▼
    ┌──────────────────┐
    │ Return Response   │
    └──────────────────┘
               │
               ▼
              [End]
```

### 7.2 Process Refund Activity

```
                    [Start]
                        │
                        ▼
            ┌───────────────────────┐
            │ Receive Refund Request│
            └───────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │ Find Payment by ID    │
            └───────────────────────┘
                        │
               ┌────────┴────────┐
               │                 │
               ▼                 ▼
          [Found]          [Not Found]
               │                 │
               ▼                 ▼
    ┌──────────────────┐  ┌──────────────┐
    │ Check Status     │  │ Return Error │
    └──────────────────┘  └──────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
  [COMPLETED]    [Other Status]
       │               │
       ▼               ▼
┌─────────────┐  ┌──────────────┐
│ Process     │  │ Return Error │
│ Refund      │  └──────────────┘
└─────────────┘
       │
       ▼
┌─────────────┐
│ Set Status  │
│ REFUNDED    │
└─────────────┘
       │
       ▼
┌─────────────┐
│ Save Payment│
└─────────────┘
       │
       ▼
┌─────────────┐
│ Return      │
│ Response    │
└─────────────┘
       │
       ▼
      [End]
```

---

## 8. API Endpoints

### 8.1 Payment Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | /api/payments | Create a new payment | ADMIN, EMPLOYEE, CUSTOMER |
| GET | /api/payments/{paymentId} | Get payment by ID | ADMIN, EMPLOYEE, CUSTOMER |
| GET | /api/payments/order/{orderId} | Get payments by order ID | ADMIN, EMPLOYEE |
| GET | /api/payments/user/{userId} | Get payments by user ID | ADMIN, EMPLOYEE, CUSTOMER |
| GET | /api/payments/status/{status} | Get payments by status | ADMIN |
| POST | /api/payments/refund | Process refund | ADMIN, EMPLOYEE |
| PUT | /api/payments/{paymentId}/cancel | Cancel payment | ADMIN, EMPLOYEE, CUSTOMER |
| GET | /api/payments | Get service info | ADMIN |

---

## 9. Database Schema

### 9.1 Payments Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key, auto-increment |
| payment_id | VARCHAR(255) | Unique payment identifier |
| order_id | BIGINT | Foreign key to order |
| user_id | BIGINT | Foreign key to user |
| amount | DECIMAL(10,2) | Payment amount |
| status | VARCHAR(50) | Payment status (enum) |
| payment_method | VARCHAR(50) | Payment method (enum) |
| transaction_id | VARCHAR(255) | Transaction ID from gateway |
| description | VARCHAR(500) | Payment description |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

---

## 10. Technology Stack

- **Backend Framework**: Spring Boot 3.2.5
- **Language**: Java 17
- **Database**: MySQL
- **ORM**: Spring Data JPA
- **Service Discovery**: Spring Cloud Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Security**: Spring Security
- **AOP**: Spring AOP
- **Build Tool**: Maven
- **Containerization**: Docker
- **Logging**: SLF4J with Logback

---

## 11. Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                           │
│                    (Port: 8080)                          │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Order Service│ │Payment Service│ │User Service  │
│  (Port: 8082) │ │  (Port: 8084) │ │  (Port: 8083) │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Discovery Server │
              │  (Port: 8761)    │
              └──────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   MySQL Database │
              │  (Port: 3306)    │
              └──────────────────┘
```

---

## 12. Testing Strategy

### 12.1 Unit Testing
- Test service layer methods
- Test repository methods
- Test mapper functions
- Test exception handling

### 12.2 Integration Testing
- Test API endpoints
- Test database operations
- Test security configurations
- Test AOP aspects

### 12.3 End-to-End Testing
- Test complete payment flow
- Test refund flow
- Test error scenarios
- Test performance under load

---

## 13. Appendix

### 13.1 Payment Status Transitions
```
PENDING → COMPLETED
PENDING → FAILED
PENDING → CANCELLED
COMPLETED → REFUNDED
```

### 13.2 Error Codes
| Code | Description |
|------|-------------|
| 404 | Payment not found |
| 400 | Invalid request parameters |
| 401 | Unauthorized access |
| 403 | Forbidden (insufficient permissions) |
| 500 | Internal server error |

---

**Document End**
