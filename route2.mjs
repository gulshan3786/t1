// route.mjs
import express from "express";
import db from './db.mjs';

const router = express.Router();

const ITEMS_PER_PAGE = 10; // Adjust the number of items per page as needed

router.get(`/attendance`, (req, res) => {
    var page = parseInt(req.query.page) || 1;
    var month=(req.query.month)|| 1;
    var order = req.query.order || 'studentid';
    var dir = req.query.dir || 'asc';
    if(month==undefined){
        month=1;
    }
    if(order==undefined){
        order='studentid';
    }
    if(dir==undefined){
        dir='asc';
    }

   
    const offset = (page - 1) * ITEMS_PER_PAGE;
  if(page==undefined||page==1){
    const dataQuery = `
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
MONTH(attendance_master.date) = ${month}
    
GROUP BY
    student_master.studentid,
    student_master.firstname
ORDER BY
${order} ${dir.toUpperCase()} `;

    
    const countQuery = `
         SELECT COUNT(*) AS totalCount
         FROM (${dataQuery}) AS data`;

         
        
         db.query(countQuery, (countError, countResults) => {
            if (countError) {
                console.error('Error executing count SQL query:', countError);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            const totalCount = countResults[0].totalCount;
    
            db.query(`${dataQuery} LIMIT ${offset}, ${ITEMS_PER_PAGE}`, (error, results) => {
                if (error) {
                    console.error('Error executing data SQL query:', error);
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
                const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    
                res.render('index2', {
                    columns: columns,
                    rows: results,
                    page: page,
                    totalPages: totalPages,
                    month:month,
                    order:order,
                    dir:dir
                });
            });
        });
  }
  else{
    const dataQuery = `
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
MONTH(attendance_master.date) = ${month}
    
GROUP BY
    student_master.studentid,
    student_master.firstname
ORDER BY
${order} ${dir.toUpperCase()}`;


const countQuery = `
     SELECT COUNT(*) AS totalCount
     FROM (${dataQuery}) AS data`;

     
    
     db.query(countQuery, (countError, countResults) => {
        if (countError) {
            console.error('Error executing count SQL query:', countError);
            res.status(500).send('Internal Server Error');
            return;
        }

        const totalCount = countResults[0].totalCount;

        db.query(`${dataQuery} LIMIT ${offset}, ${ITEMS_PER_PAGE}`, (error, results) => {
            if (error) {
                console.error('Error executing data SQL query:', error);
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
            const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

            res.render('index2', {
                columns: columns,
                rows: results,
                page: page,
                totalPages: totalPages,
                month:month,
                order:order,
                dir:dir
            });
        });
    });
  }


 // Query to fetch paginated data
   
});

export default router;
