import pool from "../config/db.js";
import jwt from 'jsonwebtoken';

const generateToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' }); 
};

export const register = async (req, res) => {
    
    const { name, gmail, password } = req.body;
    let role;

    try {
        const student = await pool.query('SELECT * FROM student_dummy WHERE Username = ?', [gmail]);
        const teacher = await pool.query('SELECT * FROM teacher_dummy WHERE Username = ?',[gmail]);
        if (student[0].length > 0 || teacher[0].length > 0) {
            if(student[0].length > 0){
                role=2;
            }
            else{
                role=1;
            }
            await pool.query('INSERT INTO register (Name, Email, Password, Role, SpecialAccess) VALUES(?,?,?,?,?)', [name, gmail, password, role, null]);
            res.status(200).send('Registration successful');
        } else {
            res.status(400).send('Invalid email');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};

export const verify = async (req, res) => {
    const { gmail, password } = req.body;

    try {
        const teacher = await pool.query('SELECT * FROM login_details WHERE Username = ? AND Password = ?', [gmail, password]);
        const student = await pool.query('SELECT * FROM student_dummy WHERE Username = ? AND Password = ?', [gmail, password]);

        if (student[0].length > 0 || teacher[0].length > 0) {
            res.status(200).send('Email and Password verified');
        } else {
            res.status(400).send('Invalid Credentials');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};

export const checkRegistration = async (req, res) => {
    const email = req.params.email;

    try {
        const results = await pool.query('SELECT * FROM register WHERE Email = ? AND Password IS NOT NULL', [email]);
        if (results[0].length > 0) {
            res.status(200).json({ registered: true });
        } else {
            res.status(200).json({ registered: false });
        }
    } catch(err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};

export const login = async (req, res) => {
    const { gmail, password } = req.body;
    try {
        const results = await pool.query('SELECT * FROM register WHERE Email = ? AND Password = ?', [gmail, password]);
        
        if (results[0].length > 0) {
            const user = results[0][0];
            const accessToken = generateToken({ id: user.id, email: user.Email, role: user.Role });

            res.status(200).send({
                success: true,
                message: 'Login Successful',
                data: {
                    user,
                    accessToken,
                },
            });
        } else {
            res.status(401).send({
                success: false,
                message: 'Invalid credentials',
                data: 'Invalid credentials',
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: 'Error in login',
            data: err.message,
        });
    }
};

export const getAllTeacher = async (req,res) => {
    try {
        const teacher = await pool.query('SELECT Name, Email, Role, SpecialAccess FROM register WHERE Role = 1');
        if(teacher[0].length > 0){
            res.status(200).send({
                success:true,
                message:'Data Fetched Successfully',
                data:teacher[0]
            });
        }
        else{
            res.status(401).send({
                success:false,
                message:'No Data Found',
                data:'No Data Found'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success:false,
            message:'Error in Fetching data',
            data:err.message
        });
    }
}

export const getAllStudent = async (req,res) => {
    try {
        const student = await pool.query('SELECT Name, Email, Role, SpecialAccess FROM register WHERE Role = 2');
        if(student[0].length > 0){
            res.status(200).send({
                success:true,
                message:'Data Fetched Successfully',
                data:student[0]
            });
        }
        else{
            res.status(401).send({
                success:false,
                message:'No Data Found',
                data:'No Data Found'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success:false,
            message:'Error in Fetching data',
            data:err.message
        });
    }
}
