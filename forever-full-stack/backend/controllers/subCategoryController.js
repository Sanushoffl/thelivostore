import subCategoryModel from "../models/subCategoryModel.js"

// function for add subCategory
const addSubCategory = async (req, res) => {
    try {
        const { name } = req.body

        if (!name || name.trim() === '') {
            return res.json({ success: false, message: "SubCategory name is required" })
        }

        // Check if subCategory already exists
        const existing = await subCategoryModel.findOne({ name: name.trim() })
        if (existing) {
            return res.json({ success: false, message: "SubCategory already exists" })
        }

        const subCategoryData = {
            name: name.trim(),
            date: Date.now()
        }

        const subCategory = new subCategoryModel(subCategoryData);
        await subCategory.save()

        res.json({ success: true, message: "SubCategory Added", subCategory })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list subCategories
const listSubCategories = async (req, res) => {
    try {
        const subCategories = await subCategoryModel.find({}).sort({ date: -1 });
        res.json({ success: true, subCategories })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for update subCategory
const updateSubCategory = async (req, res) => {
    try {
        const { id, name } = req.body

        if (!name || name.trim() === '') {
            return res.json({ success: false, message: "SubCategory name is required" })
        }

        // Check if another subCategory with same name exists
        const existing = await subCategoryModel.findOne({ name: name.trim(), _id: { $ne: id } })
        if (existing) {
            return res.json({ success: false, message: "SubCategory name already exists" })
        }

        const subCategory = await subCategoryModel.findByIdAndUpdate(
            id,
            { name: name.trim() },
            { new: true }
        )

        if (!subCategory) {
            return res.json({ success: false, message: "SubCategory not found" })
        }

        res.json({ success: true, message: "SubCategory Updated", subCategory })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing subCategory
const removeSubCategory = async (req, res) => {
    try {
        const { id } = req.body

        const subCategory = await subCategoryModel.findByIdAndDelete(id)

        if (!subCategory) {
            return res.json({ success: false, message: "SubCategory not found" })
        }

        res.json({ success: true, message: "SubCategory Removed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addSubCategory, listSubCategories, updateSubCategory, removeSubCategory }

