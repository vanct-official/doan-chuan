const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'front-end/src/pages/customer/TourDetailPage.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

const missingImports = `
import api from '../../services/api';
import { toast } from 'react-toastify';
import OverviewTab from './TourDetailTabs/OverviewTab';
import PeopleTab from './TourDetailTabs/PeopleTab';
import VehiclesTab from './TourDetailTabs/VehiclesTab';
import ScheduleTab from './TourDetailTabs/ScheduleTab';
`;

if (!content.includes('import api from')) {
    content = content.replace(/import React, \{.*?\} from 'react';/, (match) => match + '\n' + missingImports);
}

content = content.replace(/setOpenAttendance/g, 'setAttendanceModalOpen');
content = content.replace(/setOpenItineraryModal/g, 'setItineraryModalOpen');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed TourDetailPage.jsx!');
