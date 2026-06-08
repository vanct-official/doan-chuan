const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Route handlers 
const tourController = require('../controllers/tourController');
const membershipController = require('../controllers/membershipController');
const vehicleController = require('../controllers/vehicleController');
const authController = require('../controllers/authController');
const groupController = require('../controllers/groupController');
const itineraryController = require('../controllers/itineraryController');
const attendanceController = require('../controllers/attendanceController');
const settingController = require('../controllers/settingController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post('/auth/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.post('/auth/login', authController.login);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login user with Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token (credential) from Google Identity Services
 *     responses:
 *       200:
 *         description: Logged in successfully with Google
 *       400:
 *         description: Invalid Google Token
 */
router.post('/auth/google', authController.googleLogin);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get('/users', authController.getAllUsers);
router.put('/users/:id/status', authMiddleware, authController.toggleUserStatus);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Profile details
 *       401:
 *         description: Unauthorized
 */
router.get('/users/profile', authMiddleware, authController.getProfile);
router.get('/users/check-phone/:phone', authMiddleware, authController.checkPhone);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               dob:
 *                 type: string
 *               gender:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/users/profile', authMiddleware, authController.updateProfile);

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change or set user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/users/change-password', authMiddleware, authController.changePassword);

/**
 * @swagger
 * tags:
 *   name: Tours
 *   description: Tour management API
 */

/**
 * @swagger
 * /tours:
 *   post:
 *     summary: Create a new tour
 *     tags: [Tours]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Chuyến đi Đà Nẵng"
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               max_capacity:
 *                 type: number
 *                 example: 50
 *               leader_id:
 *                 type: string
 *                 example: "64d2bd50f1464b001a123abc"
 *     responses:
 *       201:
 *         description: Tour created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tour:
 *                   $ref: '#/components/schemas/Tour'
 *                 membership:
 *                   $ref: '#/components/schemas/Membership'
 *       500:
 *         description: Server error
 */
router.post('/tours', authMiddleware, tourController.createTour);

/**
 * @swagger
 * /tours:
 *   get:
 *     summary: Get all tours
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: A list of tours
 */
router.get('/tours', tourController.getAllTours);

// — Must be registered BEFORE /tours/:id to avoid route conflict —
router.get('/tours/my', authMiddleware, tourController.getMyTours);

/**
 * @swagger
 * /tours/{id}:
 *   get:
 *     summary: Get a single tour's detail with memberships and vehicles
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tour details fetched successfully
 *       404:
 *         description: Tour not found
 */
router.get('/tours/:id', tourController.getTourById);

/**
 * @swagger
 * /tours/{id}:
 *   put:
 *     summary: Update a tour's details (Leader or Creator only)
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *               max_capacity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tour updated successfully
 *       403:
 *         description: Forbidden (Not owner/leader)
 *       404:
 *         description: Tour not found
 */
router.put('/tours/:id', authMiddleware, tourController.updateTour);
router.delete('/tours/:id', authMiddleware, tourController.deleteTour);

/**
 * @swagger
 * tags:
 *   name: Memberships
 *   description: Membership & participant management API
 */

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Join a tour (User or Guest)
 *     tags: [Memberships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tour_id:
 *                 type: string
 *                 example: "64d2bd50f1464b001a123def"
 *               user_id:
 *                 type: string
 *                 example: "64d2bd50f1464b001a123abc"
 *                 description: "Optional if guest"
 *               guest_info:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *               role:
 *                 type: string
 *                 example: "member"
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Bad request (Deadline passed, over capacity, etc.)
 *       404:
 *         description: Tour or User not found
 */
router.post('/members', membershipController.addMember);

/**
 * @swagger
 * /members/approve:
 *   put:
 *     summary: Bulk approve pending members
 *     tags: [Memberships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membership_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64d2bd50f1464b001a123ghi", "64d2bd50f1464b001a123jkl"]
 *     responses:
 *       200:
 *         description: Members approved successfully
 */
router.put('/members/approve', membershipController.bulkApproveMembers);
router.put('/members/:id', authMiddleware, membershipController.updateMember);
router.delete('/members/:id', authMiddleware, membershipController.deleteMember);
router.post('/members/:id/leave', authMiddleware, membershipController.leaveTour);
router.post('/members/batch', authMiddleware, membershipController.addMembersBatch);

/**
 * @swagger
 * /tours/{id}/import-excel:
 *   post:
 *     summary: Import members via Excel
 *     tags: [Memberships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imported successfully
 *       400:
 *         description: Bad request (invalid data)
 */
router.post('/tours/:id/import-excel', authMiddleware, upload.single('file'), membershipController.importExcel);

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle management API
 */

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Create a new vehicle for a tour
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tour_id:
 *                 type: string
 *               license_plate:
 *                 type: string
 *               plate_color:
 *                 type: string
 *               seat_count:
 *                 type: number
 *               driver_name:
 *                 type: string
 *               driver_phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       404:
 *         description: Tour not found
 */
router.post('/vehicles', authMiddleware, vehicleController.createVehicle);
router.put('/vehicles/:id', authMiddleware, vehicleController.updateVehicle);
router.delete('/vehicles/:id', authMiddleware, vehicleController.deleteVehicle);

/**
 * @swagger
 * /vehicles/assign:
 *   post:
 *     summary: Assign a member to a vehicle
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membership_id:
 *                 type: string
 *                 example: "64d2bd50f1464b001a123ghi"
 *               vehicle_id:
 *                 type: string
 *                 example: "64d2bd50f1464b001a123vhl"
 *     responses:
 *       200:
 *         description: Member assigned to vehicle successfully
 *       400:
 *         description: Over capacity or tour mismatch
 */
router.post('/vehicles/assign', vehicleController.assignMemberToVehicle);
router.post('/vehicles/assign-batch', authMiddleware, vehicleController.assignMembersBatch);
router.post('/vehicles/:id/assign-leader', authMiddleware, vehicleController.assignVehicleLeader);

// Group routes
router.post('/groups', authMiddleware, groupController.createGroup);
router.get('/groups', groupController.getGroupsByTour);

// ----------------------------------------------------------------------
// Itinerary routes
// ----------------------------------------------------------------------
router.get('/tours/:tourId/itineraries', itineraryController.getItinerariesByTour);
router.post('/itineraries', authMiddleware, itineraryController.createItinerary);
router.put('/itineraries/:id', authMiddleware, itineraryController.updateItinerary);
router.delete('/itineraries/:id', authMiddleware, itineraryController.deleteItinerary);

// ----------------------------------------------------------------------
// Attendance routes
// ----------------------------------------------------------------------
router.get('/attendance', authMiddleware, attendanceController.getAttendanceByItineraryAndVehicle);
router.get('/attendance/tour/:tourId', authMiddleware, attendanceController.getAttendanceByTour);
router.post('/attendance/batch', authMiddleware, attendanceController.markAttendanceBatch);

// ----------------------------------------------------------------------
// Setting routes
// ----------------------------------------------------------------------
router.get('/settings/:key', settingController.getSetting);
router.put('/settings/:key', authMiddleware, settingController.updateSetting);

module.exports = router;
