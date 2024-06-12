import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const initialState = {
  loading: false,
  notifications: [],
  currentLocation: {},
  nearbyBusiness: [],
  nearbyBusinessCenter: {},
  ignoredList: [],
  cart: {
    business: {},
    items: []
  },
  fundraiserMessages: [],
  prizesCount: 0
}

const Context = createContext(initialState)

const Provider = ({ children }) => {

  const [state, setState] = useState(initialState)

  useEffect(() => {
    AsyncStorage.getItem('@cart')
      .then(json => {
        const cart = JSON.parse(json) || { business: {}, items: [] }
        console.log('restore cart', cart)
        setState({ ...state, cart })
      })
      .catch(error => console.log('error restoring cart', error))
  }, [])

  useEffect(() => {
    console.log('cart changed!!!');
    AsyncStorage.setItem('@cart', JSON.stringify(state.cart))
      .then(() => console.log('cart saved!', JSON.stringify(state.cart)))
      .catch(error => console.log('error persisting cart', error))
  }, [state.cart])

  return (
    <Context.Provider value={[state, setState]}>
      {children}
    </Context.Provider>
  )
}

export default { Context, Provider }