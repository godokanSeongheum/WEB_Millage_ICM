import {combineReducers} from 'redux';
import {all} from 'redux-saga/effects';
import DMReducer from './DM/reducer';
import BoardReducer from './board/reducer';
import UnitReducer from './Unit/reducer';
import UserReducer from './User/reducer';
import dmSaga from './DM/sagas';
import boardSaga from './board/sagas';
import {
  checkSessionListener,
  createUserSagaListener,
  loginSagaListener,
} from './User/sagas';
import {
  getUnitListSagaListener,
} from './Unit/sagas';


const rootReducer = combineReducers({
  DM: DMReducer,
  user: UserReducer,
  Board: BoardReducer,
  unit: UnitReducer,
});

export default rootReducer;

export function* rootSaga() {
  yield all([
    dmSaga(),
    createUserSagaListener(),
    loginSagaListener(),
    checkSessionListener(),
    boardSaga(),
    getUnitListSagaListener(),
  ]);
}

export type RootState = ReturnType<typeof rootReducer>
