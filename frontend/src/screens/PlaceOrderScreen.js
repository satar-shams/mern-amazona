import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };

    case 'CREATE_SUCCESS':
      return { ...state, loading: false };

    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );

  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;
  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);
  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>

      <div className="placeorder">
        <div className="placeorder-info">
          <div>
            <h3>Shipping</h3>
            <div>
              <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
              <strong>Address:</strong> {cart.shippingAddress.Address}
              {cart.shippingAddress.city}, {cart.shippingAddress.postalCode},
              {cart.shippingAddress.country}
              <br />
              <br />
              <Link to="/shipping">Edit</Link>
            </div>
          </div>
          <div>
            <h3>Payment</h3>
            <div>Payment Method: {cart.paymentMethod}</div>
          </div>

          <div>
            <ul className="cart-list-container">
              <li>
                <h3>items</h3>
                <div>Price</div>
              </li>
              {cart.cartItems.length === 0 ? (
                <div>Cart is empty</div>
              ) : (
                cart.cartItems.map((item) => (
                  <li key={item.slug}>
                    <div className="cart-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-name">
                      <div>
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </div>
                      <div>Qty: {item.quantity}</div>
                    </div>
                    <div className="cart-price">$ {item.price}</div>
                  </li>
                ))
              )}
            </ul>
            <Link to="cart">Edit</Link>
          </div>
        </div>
        <div className="placeorder-action">
          <ul>
            <li>
              <button
                className="button primary full-width"
                onClick={placeOrderHandler}
                disabled={cart.cartItems.length === 0}
              >
                Place Order
              </button>
              {loading && <div className="loader"></div>}
            </li>
            <li>
              <h3>Order Summary</h3>
            </li>
            <li>
              <div>Items</div>
              <div>${cart.itemsPrice.toFixed(2)}</div>
            </li>
            <li>
              <div>Shipping</div>
              <div>${cart.shippingPrice.toFixed(2)}</div>
            </li>
            <li>
              <div>Tax</div>
              <div>${cart.taxPrice.toFixed(2)}</div>
            </li>
            <li>
              <div>Order Total</div>
              <div>${cart.totalPrice.toFixed(2)}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
