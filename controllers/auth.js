import mysql from 'mysql'
import bcrypt from "bcryptjs"
import {configDB} from "../configDB.js"
import { response } from 'express'
import { upload } from '../tmp/cloudinary.js'
import {upload} from '../cloudinary.js'
const db=mysql.createConnection(configDB)

/*export const login=(request,response)=>{
    console.log(request.body)
    const {username,password}=request.body
    db.query('SELECT count(*) nr FROM users WHERE username=? and password=?',[username,password],(err,result)=>{
        if(err)
            console.log("hiba!!",err)
        else
            response.send({rowCount:result[0].nr,username:username})

    })
}*/

export const login=(request,response)=>{
    console.log(request.body)
    const {username,password}=request.body
    db.query('SELECT id,password FROM users WHERE username=?',[username],(err,result)=>{
        if(err)
            console.log("hiba!!",err)
        else{
            //console.log(result[0].password)
            bcrypt.compare(password, result[0].password,(err,resultCompare)=>{
                if(err)
                    response.send({error:"Hibás jelszó!"})
                else
                    response.send({username:username,userId:result[0].id})
            })
        }

    })
}

const saltRound=10
export const register=(request,response)=>{
    const {username,email,password} = request.body
    bcrypt.hash(password,saltRound,(err,hashedPassword)=>{
        if(err){
            console.log('BCRYPT HIBA!',err)
        }
        else{
            db.query('INSERT INTO users (username,email,password) values (?,?,?)',[username,email,hashedPassword],(err,result)=>{
                if(err){
                    console.log('HIBA AZ INSERT-NÉL!',err)
                    response.send({msg:'Nem sikerült a regisztráció'})
                }
                    
                else
                    response.send({msg:'SIKERES REGISZTRÁCIÓ! ',id:result.insertId})
            })
        }
    })
}
export const checkEmail=(request,response)=>{
    console.log(request.body)
    const {email}=request.body
    db.query('SELECT count(*) nr FROM users WHERE email=?',[email],(err,result)=>{
        if(err)
            console.log("hiba!!",err)
        else
            response.send({rowCount:result[0].nr,email:email})

    })
    
}
export const checkUsername=(request,response)=>{
    console.log(request.body)
    const {username}=request.body
    db.query('SELECT count(*) nr FROM users WHERE username=?',[username],(err,result)=>{
        if(err)
            console.log("hiba!!",err)
        else
            response.send({rowCount:result[0].nr,username:username})

    })
}

export const updateAvatar=async (request,response) => {
    const [username] =request.body
    if(request.files){
        const {selFile}=request.files
        const cloudFile=await upload(selFile.tempFilePath)
        console.log(cloudFile)
        db.query('update users set avatar=?,avatar_id=? where username=?',
        [cloudFile.url,cloudFile.public_id,username],(err,result)=>{
            if(err)
                console.log(err)
            else{
                response.send({msg:"Sikeres módosítás",avatar:cloudFile.url})
            }
        })
    }
}

