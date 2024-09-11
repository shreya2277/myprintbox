import { useEffect, useState } from "react";
import Layout from "./Layout";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/use-toast";

const Host = () => {
  const user = useAuth();
  const navigate = useNavigate();
  const {toast} = useToast();

  if (!user.userId) {
    navigate("/");
  }

  const [countries, setCountries] = useState([]);

  const [formData, setFormData] = useState({
    UserId: user.userId,
    carName: "",
    carNumber: "",
    carModel: "",
    carType: "",
    carSeats: "",
    carFuelType: "",
    carDeliveryType: "",
    carPrice: "",
    carCountry: "",
    carCity: "",
    carImage: null,
    startDate: "",
    endDate: "",
    available: true,
  });
}
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "carCountry") {
      const selectedCountry = countries.find(
        (country) => country.name === value
      );
      setFormData({
        ...formData,
        [name]: value,
        carCity: selectedCountry.cities[0],
        userId: user.userId,
        available: true,
      });
      return;
    }

    const updatedValue =
      name === "startDate" || name === "endDate"
        ? new Date(value).toISOString().split("T")[0]
        : value;
    setFormData({
      ...formData,
      [name]: updatedValue,
      userId: user.userId,
      available: true,
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      carImage: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      const response = await fetch("http://localhost:8080/api/car/add", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        console.log("Car added successfully!");
        console.log(response);
        // Reset form fields
        setFormData({
          carName: "",
          carNumber: "",
          carModel: "",
          carType: "",
          carSeats: "",
          carFuelType: "",
          carDeliveryType: "",
          carPrice: "",
          carCountry: "",
          carCity: "",
          carImage: null,
          startDate: null,
          endDate: null,
        });
        toast({
          title: "Car added successfully!",
          description: "Your car has been added successfully.",
          type: "success",
        })
      } else {
        console.error("Error adding car:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding car:", error);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/countries")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data);
      });
  }, []);

  
