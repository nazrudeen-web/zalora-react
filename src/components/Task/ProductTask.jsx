import React, { useState, useEffect } from "react";
import { FaDollarSign } from "react-icons/fa";
import data from "../../data.json";
import { supabase } from "../../supabase";
import { SlControlStart } from "react-icons/sl";

const ProductTask = ({ setShowModal }) => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [earned, setEarned] = useState(0);

  const getRandomProduct = () => {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  };

  useEffect(() => {
    setCurrentProduct(getRandomProduct());
  }, []); // Empty dependency array ensures this effect runs only once

  // Function to get current user's ID
  async function getCurrentUserID() {
    try {
      const user = (await supabase.auth.getUser()).data.user.id;
      return user;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  getCurrentUserID();

  useEffect(() => {
    // Calculate earned amount when a new product is generated
    if (currentProduct) {
      const commission = (currentProduct.price * 0.01).toFixed(2);
      setEarned(() => earned + parseFloat(commission));
    }
  }, [currentProduct]);

  useEffect(() => {
    // Calculate earned amount when a new product is generated
    if (currentProduct) {
      const totalAmount = (currentProduct.price * 0.01).toFixed(2);
      setTotalAmount(() => earned + parseFloat(totalAmount));
    }
  }, [currentProduct]);

  async function saveUserData(userId, balance, earnedAmount) {
    try {
      // Check if user data already exists
      const { data, error } = await supabase
        .from("user_data")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
      let newEarnedAmount = earnedAmount;
      let newTotalAmount = totalAmount; // Initialize with the passed earned amount
      // If user data exists, update existing row with incremented earned amount
      if (data && data.length > 0) {
        const existingEarnedAmount = data[0].earned_amount;
        newEarnedAmount = existingEarnedAmount + earnedAmount;
        const existingTotalAmount = data[0].balance;
        newTotalAmount = existingTotalAmount + totalAmount;
      }

      const { error: saveError } = await supabase.from("user_data").upsert({
        user_id: userId,
        balance: balance,
        earned_amount: newEarnedAmount,
      });

      if (saveError) {
        throw saveError;
      }
      console.log(newEarnedAmount);
      console.log(newTotalAmount);
      console.log("User data saved successfully.");
    } catch (error) {
      console.error("Error saving user data:", error.message);
    }
  }

  const handleConfirm = async () => {
    setCurrentProduct(getRandomProduct());
    setShowModal(false);
    try {
      const userId = await getCurrentUserID();
      // Pass newEarned instead of earned
      await saveUserData(userId, totalAmount, earned);
    } catch (error) {
      console.error("Error confirming review:", error);
    }
  };

  if (!currentProduct) {
    return <div>Loading...</div>;
  }

  const { name, price, quantity, image } = currentProduct;

  return (
    <>
      <h3 className="font-bold text-lg">Order task</h3>
      <p className="py-4 text-center text-sm font-semibold">{name}</p>
      <img src={image} alt={name} className="rounded-box h-24 mb-4" />
      <div className="details">
        <div className="detail flex items-center mb-2">
          <p>Unit Price:</p>
          <p className="flex justify-end items-center font-medium">
            <FaDollarSign />
            {(price / quantity).toFixed(2)}
          </p>
        </div>
        <div className="detail flex items-center mb-2">
          <p>Order Quantity:</p>
          <p className="text-end">{quantity}</p>
        </div>
        <div className="detail flex items-center mb-2">
          <p>Total:</p>
          <p className="flex justify-end items-center font-medium">
            <FaDollarSign />
            {price}
          </p>
        </div>
        <div className="detail flex items-center mb-2">
          <p>Commission:</p>
          <p className="flex justify-end items-center font-medium">
            <FaDollarSign />
            {(price * 0.01).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card w-full bg-indigo-200 shadow-sm mt-6">
        <div className="card-body px-4 py-6">
          <div className="rating gap-2 mb-2">
            <p className="text-sm">Ratings:</p>
            {[...Array(5)].map((_, index) => (
              <input
                key={index}
                type="radio"
                name="rating-2"
                className="mask mask-star-2 bg-indigo-700"
              />
            ))}
          </div>
          <p className="text-sm">Select Your Reviews:</p>
          <select className="select select-primary w-full max-w-xs">
            <option value="option1">Amazing product! Highly recommend!</option>
            <option value="option2">Love it! Great quality!</option>
            <option value="option3">Impressive! Must-have item!</option>
            <option value="option4">Incredible value! 5 stars!</option>
            <option value="option5">Perfect fit! Highly satisfied!</option>
          </select>
        </div>
      </div>
      <button
        className="btn btn-primary text-white w-full text-base mt-4 rounded-full"
        onClick={handleConfirm}
      >
        Confirm Review
      </button>
    </>
  );
};

export default ProductTask;
