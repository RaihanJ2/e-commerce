import Review from "@models/review";
import { connectDB } from "@utils/db";

const getReviews = async () => {
  const reviews = await Review.find().populate("userId").populate("productId");
  return reviews;
};

const createUserItemMatrix = (reviews) => {
  const userItemMatrix = {};
  const users = new Set();
  const products = new Set();

  reviews.forEach((review) => {
    users.add(review.userId._id.toString());
    products.add(review.productId._id.toString());
  });

  users.forEach((user) => {
    userItemMatrix[user] = {};
    products.forEach((product) => {
      userItemMatrix[user][product] = 0;
    });
  });

  reviews.forEach((review) => {
    userItemMatrix[review.userId._id.toString()][
      review.productId._id.toString()
    ] = review.rating;
  });

  return {
    userItemMatrix,
    users: Array.from(users),
    products: Array.from(products),
  };
};

const cosineSimilarity = (item1, item2, userItemMatrix, users) => {
  let sum = 0;
  let sumItem1 = 0;
  let sumItem2 = 0;

  users.forEach((user) => {
    const rating1 = userItemMatrix[user][item1];
    const rating2 = userItemMatrix[user][item2];

    if (rating1 && rating2) {
      sum += rating1 * rating2;
      sumItem1 += rating1 * rating1;
      sumItem2 += rating2 * rating2;
    }
  });

  return sum / (Math.sqrt(sumItem1) * Math.sqrt(sumItem2));
};

const recommendItems = (userId, userItemMatrix, users, products, k = 5) => {
  const userRatings = userItemMatrix[userId];
  const itemScores = {};

  products.forEach((ratedItem) => {
    if (userRatings[ratedItem] > 0) {
      products.forEach((otherItem) => {
        if (ratedItem !== otherItem) {
          const similarity = cosineSimilarity(
            ratedItem,
            otherItem,
            userItemMatrix,
            users
          );
          if (!itemScores[otherItem]) {
            itemScores[otherItem] = 0;
          }
          itemScores[otherItem] += similarity * userRatings[ratedItem];
        }
      });
    }
  });

  const recommendations = Object.entries(itemScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, k)
    .map(([item]) => item);

  return recommendations;
};

export const GET = async (req, res) => {
  await connectDB();
  const { userId } = req.query;
  console.log("Received userId:", userId); // Add this line to check userId in console

  try {
    const reviews = await getReviews();
    const { userItemMatrix, users, products } = createUserItemMatrix(reviews);
    const recommendations = recommendItems(
      userId,
      userItemMatrix,
      users,
      products
    );

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
