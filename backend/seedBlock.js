// seedBlocks.js
const mongoose = require('mongoose');
const Block = require('./models/Block'); 


const blocks = [
  { name: 'AB1', room: 101 },
  { name: 'AB1', room: 102 },
  { name: 'AB1', room: 103 },
  { name: 'AB1', room: 104 },
  { name: 'AB1', room: 105 },

  { name: 'AB1', room: 201 },
  { name: 'AB1', room: 202 },
  { name: 'AB1', room: 203 },
  { name: 'AB1', room: 204 },
  { name: 'AB1', room: 205 },

  { name: 'AB2', room: 101 },
  { name: 'AB2', room: 102 },
  { name: 'AB2', room: 103 },
  { name: 'AB2', room: 104 },
  { name: 'AB2', room: 105 },

  { name: 'AB2', room: 201 },
  { name: 'AB2', room: 202 },
  { name: 'AB2', room: 203 },
  { name: 'AB2', room: 204 },
  { name: 'AB2', room: 205 },

];

async function seedBlocks() {
  try {
    console.log('MongoDB Connected...');

    // Clear old data
    await Block.deleteMany({});
    console.log('Old blocks removed.');

    // Insert new blocks
    const result = await Block.insertMany(blocks);
    console.log(`Inserted ${result.length} blocks successfully.`);
  } catch (err) {
    console.error('Error inserting blocks:', err);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
// seedBlocks();
module.exports=seedBlocks;
