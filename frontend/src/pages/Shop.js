import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import axios from "../api/axios";
import "./Shop.css";
import { CiDollar } from "react-icons/ci";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useNavigate } from "react-router-dom";

const Shop = ({ userId, setRenderNav }) => {
  const [shopItems, setShopItems] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [purchaseConfirmationVisible, setPurchaseConfirmationVisible] =
    useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        const response = await axios.get(`/get-shop-items/${userId}`);
        const shopItemsData = response.data;
        console.log(response.data);
        setShopItems(shopItemsData);
      } catch (error) {
        console.error("Error fetching shop items:", error);
      }
    };

    fetchShopItems();
  }, []);

  const handlePurchaseItem = (itemId) => {
    setPurchaseConfirmationVisible(true);
    setItemId(itemId);
  };

  const rejectPurchase = () => {
    setPurchaseConfirmationVisible(false);
  };

  const confirmPurchase = async () => {
    try {
      await axios.post(`/purchase-item/${userId}/${itemId}`);
      setPurchaseConfirmationVisible(false);
      setRenderNav((prev) => !prev);
      alert("Item purchased successfully!");
      navigate("/student-home");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("You do not have enough points to purchase this item.");
      } else {
        console.error("Error purchasing item:", error);
      }
    }
  };

  return (
    <div className="vh-100">
      <div className="mt-5 d-flex align-items-center justify-content-center">
        <div className="courses-container bg-white p-5 border border-black rounded">
          <div className="course-title">
            <span className="fs-1 fw-medium">Shop</span>
            <div className="course-title-decoration"></div>
          </div>
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a
                className="nav-link active"
                id="tab1-tab"
                data-bs-toggle="tab"
                href="#tab1"
                role="tab"
                aria-controls="tab1"
                aria-selected="true"
              >
                Animal Avatar
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="tab2-tab"
                data-bs-toggle="tab"
                href="#tab2"
                role="tab"
                aria-controls="tab2"
                aria-selected="false"
              >
                Fruit Avatar
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="tab3-tab"
                data-bs-toggle="tab"
                href="#tab3"
                role="tab"
                aria-controls="tab3"
                aria-selected="false"
              >
                People Avatar
              </a>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            <div
              className="tab-pane fade show active"
              id="tab1"
              role="tabpanel"
              aria-labelledby="tab1-tab"
            >
              <div className="row">
                {shopItems &&
                  shopItems.map((item) => {
                    if (item.type === 1) {
                      return (
                        <div className="col-md-3" key={item.id}>
                          <div className="card item-card">
                            <img
                              src={item.image_url}
                              alt="Avatar"
                              className="item-img"
                            />
                            <div className="item-price">
                              <CiDollar className="item-icon" />
                              Price : {item.price} pts
                            </div>
                            <div className="card-body">
                              <Button
                                label="Purchase"
                                className="btn btn-success"
                                onClick={() => handlePurchaseItem(item.id)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            </div>
            <div
              className="tab-pane fade"
              id="tab2"
              role="tabpanel"
              aria-labelledby="tab2-tab"
            >
              <div className="row">
                {shopItems &&
                  shopItems.map((item) => {
                    if (item.type === 2) {
                      return (
                        <div className="col-md-3" key={item.id}>
                          <div className="card item-card">
                            <img
                              src={item.image_url}
                              alt="Avatar"
                              className="item-img"
                            />
                            <div className="item-price">
                              <CiDollar className="item-icon" />
                              Price : {item.price} pts
                            </div>
                            <div className="card-body">
                              <Button
                                label="Purchase"
                                className="btn btn-success"
                                onClick={() => handlePurchaseItem(item.id)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            </div>
            <div
              className="tab-pane fade"
              id="tab3"
              role="tabpanel"
              aria-labelledby="tab3-tab"
            >
              <div className="row">
                {shopItems &&
                  shopItems.map((item) => {
                    if (item.type === 3) {
                      return (
                        <div className="col-md-3" key={item.id}>
                          <div className="card item-card">
                            <img
                              src={item.image_url}
                              alt="Avatar"
                              className="item-img"
                            />
                            <div className="item-price">
                              <CiDollar className="item-icon" />
                              Price : {item.price} pts
                            </div>
                            <div className="card-body">
                              <Button
                                label="Purchase"
                                className="btn btn-success"
                                onClick={() => handlePurchaseItem(item.id)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="delete-confirmation-overlay"
        style={{ display: purchaseConfirmationVisible ? "block" : "none" }}
      />
      <ConfirmDialog
        className="delete-confirmation-popup"
        visible={purchaseConfirmationVisible}
        onHide={rejectPurchase}
        draggable={false}
        closable={false}
        header={<div className="delete-confirmation-header">Confirmation</div>}
        message={
          <div className="delete-confirmation-message">
            Are you sure you want to purchase this item?
          </div>
        }
        footer={
          <div className="delete-confirmation-footer">
            <Button
              label="Yes"
              class="btn btn-outline-primary"
              onClick={confirmPurchase}
            />
            <Button
              label="No"
              class="btn btn-outline-danger"
              onClick={rejectPurchase}
            />
          </div>
        }
      />
    </div>
  );
};

export default Shop;
