import Category from '../models/Category.js';
import logger from '../utils/logger.js';

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Create slug from name
        const slug = name.toLowerCase().replace(/\s+/g, '-');

        const category = await Category.create({
            name,
            description,
            slug
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        logger.error('Category creation failed:', error);
        res.status(500).json({
            success: false,
            error: error.name === 'SequelizeUniqueConstraintError' 
                ? 'Category already exists' 
                : 'Error creating category'
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        logger.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching categories'
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Update slug if name is changed
        if (req.body.name) {
            req.body.slug = req.body.name.toLowerCase().replace(/\s+/g, '-');
        }

        await category.update(req.body);

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        logger.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            error: error.name === 'SequelizeUniqueConstraintError' 
                ? 'Category name already exists' 
                : 'Error updating category'
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        await category.destroy();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        logger.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting category'
        });
    }
};