require("dotenv").config({ path: "../.env" }); // Load .env from project root
const mongoose = require("mongoose");
const initData = require("./sampledata.js"); // your sampleListings array
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Review = require("../models/review.js");

const ATLASDB_URL = process.env.ATLASDB_URL;
console.log("ENV loaded:", ATLASDB_URL);

async function main() {
    try {
        // Connect to Atlas with database name specified in connection string
        await mongoose.connect(ATLASDB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to Atlas DB");

        await initDB();
    } catch (err) {
        console.log("Error connecting to DB:", err);
    } finally {
        mongoose.connection.close();
    }
}

const initDB = async () => {
    try {
        // 1️⃣ Create default user if none exists
        let owner = await User.findOne();
        if (!owner) {
            console.log("No users found. Creating a default user...");
            owner = await User.register(
                new User({ username: "DefaultUser", email: "default@example.com" }),
                "password123"
            );
        }

        // 2️⃣ Seed Listings without deleting existing real-time listings
        const existingListingsCount = await Listing.countDocuments();
        console.log(`Existing listings in DB: ${existingListingsCount}`);

        // Only insert listings from sample data that don’t exist in DB
        for (const sampleListing of initData.data) {
            const exists = await Listing.findOne({ title: sampleListing.title });
            if (!exists) {
                const newListing = new Listing({
                    ...sampleListing,
                    owner: owner._id
                });
                await newListing.save();
                console.log(`Inserted listing: ${newListing.title}`);
            }
        }

        // 3️⃣ Optional: Seed Reviews if sampleReviews exist
        if (initData.sampleReviews && initData.sampleReviews.length > 0) {
            for (const rev of initData.sampleReviews) {
                const listing = await Listing.findOne(); // assign first listing by default
                const newReview = new Review({
                    comment: rev.comment,
                    rating: rev.rating,
                    author: owner._id,
                    listing: listing._id
                });
                await newReview.save();

                // Link review to listing
                listing.reviews.push(newReview._id);
                await listing.save();

                console.log(`Inserted review: "${rev.comment}" for listing "${listing.title}"`);
            }
        }

        console.log("Database seeding complete!");
    } catch (err) {
        console.log("Error seeding DB:", err);
    }
};

main();
