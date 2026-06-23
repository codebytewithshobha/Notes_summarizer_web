const crypto = require('crypto');

const users = new Map();

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const generateUserId = () => {
  return 'user_' + crypto.randomBytes(8).toString('hex');
};

const signUp = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    for (const user of users.values()) {
      if (user.email === email) {
        return res.status(409).json({ message: 'Email already registered' });
      }
    }

    const userId = generateUserId();
    const hashedPassword = hashPassword(password);

    users.set(userId, {
      id: userId,
      email,
      password: hashedPassword,
      name,
    });

    res.status(201).json({
      user: {
        id: userId,
        email,
        name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    let foundUser = null;
    for (const user of users.values()) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const hashedPassword = hashPassword(password);
    if (foundUser.password !== hashedPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signUp,
  signIn,
};
