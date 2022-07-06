import axios from 'axios';
import { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';

export default function CartScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;
  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry, Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping');
  };
  return (
    <div>
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>
      <div className="cart">
        <div className="cart-list">
          <ul className="cart-list-container">
            <li>
              <h3>Shopping Cart</h3>
              <div>Price</div>
            </li>
            {cartItems.length === 0 ? (
              <div>
                <MessageBox message={'Cart Is empty'}></MessageBox>
                <Link to="/">
                  <MessageBox message={'Go Shopping'}></MessageBox>
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <li>
                  <div className="cart-image">
                    <img src={item.image} alt={item.name} />{' '}
                  </div>
                  <div className="cart-name">
                    <div></div>
                    <div>
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>{' '}
                      <button
                        type="button"
                        className="button"
                        disabled={item.quantity === 1}
                        onClick={() =>
                          updateCartHandler(item, item.quantity - 1)
                        }
                      >
                        <i className="fa fa-minus-circle"></i>
                      </button>{' '}
                      <span>{item.quantity}</span>{' '}
                      <button
                        type="button"
                        className="button"
                        onClick={() =>
                          updateCartHandler(item, item.quantity + 1)
                        }
                      >
                        <i className="fa fa-plus-circle"></i>
                      </button>
                      <span>$ {item.price}</span>
                      <button
                        type="button"
                        className="button"
                        onClick={() => removeItemHandler(item)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="cart-action">
          <h3>
            Subtotal ( {cartItems.reduce((a, c) => a + c.quantity, 0)} items) :
            $ {cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
          </h3>
          <button
            onClick={checkoutHandler}
            className="button primary full-width"
            disabled={cartItems.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
