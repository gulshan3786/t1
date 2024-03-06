// route.mjs
import express from "express";
import db from './db.mjs';

const router = express.Router();

const ITEMS_PER_PAGE = 10; // Adjust the number of items per page as needed

router.get(`/attendance/:page`, (req, res) => {
    var page = parseInt(req.params.page) || 1;

    // Query to fetch paginated data
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const sql = `
        SELECT
            student_master.studentid,
            student_master.firstname,
            COUNT(CASE WHEN attendance_master.attendance_status = 'P' THEN 1 ELSE NULL END) AS total_days_present,
            CONCAT(
                ROUND(
                    (
                        COUNT(CASE WHEN attendance_master.attendance_status = 'P' THEN 1 ELSE NULL END) * 100.0 /
                        IFNULL(COUNT(DISTINCT DAY(attendance_master.date)), 1)
                    ),
                    2
                ),
                "%"
            ) AS percentage_present
        FROM
            student_master
        JOIN
            attendance_master ON student_master.studentid = attendance_master.studentid
        WHERE
            YEAR(attendance_master.date) = 2023
            AND MONTH(attendance_master.date) = 12
        GROUP BY
            student_master.studentid,
            student_master.firstname
        ORDER BY
            student_master.studentid
        LIMIT ${offset}, ${ITEMS_PER_PAGE}`;

    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (!results || results.length === 0) {
            // Handle the case when no results are returned
            console.log('No results found.');
            res.status(404).send('Not Found');
            return;
        }

        // Continue with further processing...
        const columns = Object.keys(results[0]);
        const rows = results;

        // Calculate total number of pages
        const totalItems = rows.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        res.render('index', {
            columns: columns,
            rows: results,
            currentPage: page,
            totalPages: totalPages,
        });
    });
});

export default router;
