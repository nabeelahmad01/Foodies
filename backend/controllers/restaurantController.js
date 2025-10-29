// backend/controllers/restaurantController.js
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    const { cuisineType, minRating } = req.query;

    let query = { isActive: true };

    if (cuisineType) {
      query.cuisineType = cuisineType;
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    const restaurants = await Restaurant.find(query)
      .populate('ownerId', 'name')
      .sort({ rating: -1 });

    res.json({
      status: 'success',
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch restaurants',
    });
  }
};

// @desc    Search restaurants
// @route   GET /api/restaurants/search
// @access  Public
exports.searchRestaurants = async (req, res) => {
  try {
    const { q } = req.query;

    const restaurants = await Restaurant.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { cuisineType: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
      isActive: true,
    }).limit(10);

    res.json({
      status: 'success',
      restaurants,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Search failed',
    });
  }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      'ownerId',
      'name phone',
    );

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found',
      });
    }

    const menuItems = await MenuItem.find({
      restaurantId: req.params.id,
      isAvailable: true,
    });

    res.json({
      status: 'success',
      restaurant: {
        ...restaurant.toObject(),
        menuItems,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch restaurant',
    });
  }
};

// @desc    Get restaurant menu
// @route   GET /api/restaurants/:id/menu
// @access  Public
exports.getRestaurantMenu = async (req, res) => {
  try {
    const { category } = req.query;

    let query = {
      restaurantId: req.params.id,
      isAvailable: true,
    };

    if (category) {
      query.category = category;
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

    res.json({
      status: 'success',
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch menu',
    });
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private (Restaurant owner)
exports.createRestaurant = async (req, res) => {
  try {
    const restaurantData = {
      ...req.body,
      ownerId: req.user.id,
    };

    const restaurant = await Restaurant.create(restaurantData);

    res.status(201).json({
      status: 'success',
      restaurant,
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create restaurant',
    });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Restaurant owner)
exports.updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found',
      });
    }

    // Check ownership
    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      status: 'success',
      restaurant,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update restaurant',
    });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Restaurant owner)
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found',
      });
    }

    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    await restaurant.remove();

    res.json({
      status: 'success',
      message: 'Restaurant deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete restaurant',
    });
  }
};

// @desc    Add menu item
// @route   POST /api/restaurants/:id/menu
// @access  Private (Restaurant owner)
exports.addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found',
      });
    }

    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    const menuItem = await MenuItem.create({
      ...req.body,
      restaurantId: req.params.id,
    });

    res.status(201).json({
      status: 'success',
      menuItem,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to add menu item',
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/restaurants/:id/menu/:itemId
// @access  Private (Restaurant owner)
exports.updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.itemId);

    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found',
      });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurantId);

    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.itemId,
      req.body,
      { new: true, runValidators: true },
    );

    res.json({
      status: 'success',
      menuItem: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update menu item',
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/restaurants/:id/menu/:itemId
// @access  Private (Restaurant owner)
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.itemId);

    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found',
      });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurantId);

    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    await menuItem.remove();

    res.json({
      status: 'success',
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete menu item',
    });
  }
};

// @desc    Get restaurant dashboard stats
// @route   GET /api/restaurants/:id/dashboard
// @access  Private (Restaurant owner)
exports.getDashboard = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found',
      });
    }

    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    // Get today's orders
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      restaurantId: req.params.id,
      createdAt: { $gte: todayStart },
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          restaurantId: restaurant._id,
          createdAt: { $gte: todayStart },
          paymentStatus: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    const pendingOrders = await Order.countDocuments({
      restaurantId: req.params.id,
      status: 'pending',
    });

    const totalMenuItems = await MenuItem.countDocuments({
      restaurantId: req.params.id,
    });

    res.json({
      status: 'success',
      stats: {
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        pendingOrders,
        totalMenuItems,
        rating: restaurant.rating,
        totalReviews: restaurant.totalReviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard stats',
    });
  }
};

// @desc    Get restaurant orders
// @route   GET /api/restaurants/:id/orders
// @access  Private (Restaurant owner)
exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found',
      });
    }

    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    const { status } = req.query;
    let query = { restaurantId: req.params.id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name phone')
      .populate('riderId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders',
    });
  }
};
