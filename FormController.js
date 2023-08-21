const { Form } = require('./FormModel');

const createForm = async (req, res) => {
  const { formTitle, formParameters, reviewType } = req.body;

  // Perform validation or additional checks on the received data
  if (!formTitle || !formParameters || !reviewType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create a new form
    const form = await Form.create({
      formTitle,
      formParameters,
      reviewType, // Adding the reviewType field to the form creation
    });

    res.status(201).json({ form });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Form creation failed' });
  }
};

module.exports = {
  createForm,
};


