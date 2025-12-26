import mongoose from "mongoose";

const robotsSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            default: `User-agent: *
Allow: /

Sitemap: https://gujarat.taxi/sitemap.xml`,
        },
        lastModified: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Only one robots.txt document should exist
robotsSchema.statics.getRobots = async function () {
    let robots = await this.findOne();
    if (!robots) {
        robots = await this.create({});
    }
    return robots;
};

const Robots = mongoose.models.Robots || mongoose.model("Robots", robotsSchema);

export default Robots;

















