const { Sequelize, DataTypes } = require('sequelize');

// Create a Sequelize connection for the evaluation form database
const sequelize = new Sequelize('EvaluationData', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5433',
});

sequelize.options.logging = console.log;

// Define the EvaluationForm model
const EvaluationForm = sequelize.define('EvaluationForm', {
  studentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rollNo: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  formTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  formParameters: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  formValues: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  reviewType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.TEXT, // Assuming remarks can be longer, using TEXT data type
    allowNull: true, // Allow nullable if remarks are optional
  },
  calculatedTotalMarks: { // Add the field for calculatedTotalMarks
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});


// Sync the model with the database
sequelize.sync()
  .then(() => {
    console.log('Evaluation form database synced');
  })
  .catch((error) => {
    console.error('Error syncing evaluation form database:', error);
  });


module.exports = {
  EvaluationForm,
};
