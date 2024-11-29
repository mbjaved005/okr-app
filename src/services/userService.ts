import { MongoClient } from 'mongodb';
import path from 'path';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ debug: true, path: envPath });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined');
}
const client = new MongoClient(uri);

export const getUsers = async () => {
  try {
    await client.connect();
    const database = client.db('okr-app-2');
    const users = database.collection('users');
    const userList = await users.find({}).toArray();
    return userList;
  } catch (error) {
    console.error('Error fetching users from database:', error);
    throw error;
  } finally {
    await client.close();
  }
};

export const updateMultipleUsersRole = async (userId: string, role: string) => {
  try {
    await client.connect();
    const database = client.db('okr-app-2');
    const users = database.collection('users');
    const result = await users.updateOne({ _id: new ObjectId(userId) }, { $set: { role: role } });
    console.log('Modified Count:', result);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  } finally {
    await client.close();
  }
};