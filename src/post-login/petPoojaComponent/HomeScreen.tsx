// import React, { useEffect, useRef, useState } from 'react'
// import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
// import {
//     heightPercentageToDP,
//     heightPercentageToDP as hp,
//     widthPercentageToDP,
//     widthPercentageToDP as wp,
// } from 'react-native-responsive-screen';
// import SidebarIcon from '../../svg/SidebarIcon';
// import { useDispatch, useSelector } from 'react-redux';
// import OnlineOfflineSwitch from '../OnlineOfflineSwitch';
// import { isEmpty as _isEmpty } from 'lodash';
// import { getSocketInstance, socketDisconnect } from '../../utils/socket';
// import { removeUserData } from '../../redux/redux';
// import customAxios from '../../services/appservices';

// export let socketInstance: any;

// const HomeScreen = ({ navigation }: any) => {
//     const orderDetails = useSelector((store: any) => store.orderDetails);
//     const loginToken = useSelector((store: any) => store.loginToken);
//     const userId = useSelector((store: any) => store.userId);


//     const dispatch = useDispatch();
//     const isFirstRender = useRef(true);
//     const [deleteModal, setDeleteModal] = useState(false);
//     const [isProfileModal, setIsProfileModal] = useState<boolean>(false);
//     const [orderAccept, setOrderAccept] = useState<boolean>(false)
//     const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
//     const [loading, setLoading] = useState(false);
//     const [availableOrders, setAvailableOrders] = useState<any>([])

//     const handleLogout = async () => {
//         try {
//             // await RNFetchBlob.fs.unlink(`file://${userImg}`);
//             await socketDisconnect();
//             dispatch(removeUserData());
//         } catch (err) {
//             console.log('err in handleLogOut', err);
//         }
//     };

//     const handleDelete = async () => {
//         try {
//             const res = await customAxios.patch(`/update-driver-status/${userId}`);
//             if (res) {
//                 handleLogout();
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     const newOrdersListener

//     const driverStatusToggle = async (event: boolean) => {
//         try {
//             setLoading(true);
//             setIsDriverOnline(event);
//             if (!event) {
//                 setAvailableOrders([]);
//                 await socketDisconnect();
//             } else {
//                 socketInstance = await getSocketInstance(loginToken);
//                 startSocketListeners();
//                 // emitLiveLocation();
//             }
//         } catch (error) {
//             console.log(`driverStatusToggle error :>> `, error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const startSocketListeners = () => {
//         newOrdersListener();
//         // rideAcceptResponseListener();
//         // rideStatusListener();
//         // startChatListener();
//         // checkDriver();
//     };

//     useEffect(() => {
//         if (isFirstRender.current) {
//             driverStatusToggle(isDriverOnline);
//         }
//         isFirstRender.current = false;
//     }, [isDriverOnline]);

//     return (
//         <>
//             {isProfileModal && (
//                 <View style={styles.profileModalView}>
//                     <TouchableOpacity onPress={handleLogout}>
//                         <Text style={styles.logoutText}>Logout</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                         onPress={() => {
//                             setDeleteModal(true);
//                             setIsProfileModal(false);
//                         }}>
//                         <Text style={styles.deleteText}>Delete</Text>
//                     </TouchableOpacity>
//                 </View>
//             )}
//             {deleteModal && (
//                 <View style={styles.deleteContainer}>
//                     <View style={styles.modalContainer}>
//                         {deleteModal && (
//                             <View style={styles.modalContent}>
//                                 <Text style={styles.modalText1}>
//                                     Are you sure you want to delete?
//                                 </Text>
//                                 <View style={styles.buttonContainer}>
//                                     <TouchableOpacity
//                                         style={styles.deleteButton}
//                                         onPress={handleDelete}>
//                                         <Text style={styles.buttonText}>Yes</Text>
//                                     </TouchableOpacity>
//                                     <TouchableOpacity
//                                         style={styles.cancelButton}
//                                         onPress={() => setDeleteModal(false)}>
//                                         <Text style={styles.buttonText}>No</Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             </View>
//                         )}
//                     </View>
//                 </View>
//             )}

//             {!orderAccept && (
//                 <View style={styles.headerBar}>
//                     <View>
//                         <TouchableOpacity
//                             onPress={() => {
//                                 // console.log('SideBarIcon pressed!');
//                                 navigation.toggleDrawer();
//                             }}>
//                             <SidebarIcon />
//                         </TouchableOpacity>
//                     </View>

//                     {/* {isDriverOnline && !assignedRide && ( */}
//                     {_isEmpty(orderDetails) && (
//                         <OnlineOfflineSwitch
//                             isDriverOnline={isDriverOnline}
//                             driverStatusToggle={driverStatusToggle}
//                         />
//                     )}

//                     <View style={styles.profileIcon}>
//                         <TouchableOpacity
//                             hitSlop={{
//                                 left: widthPercentageToDP(10),
//                                 right: widthPercentageToDP(5),
//                                 top: heightPercentageToDP(2),
//                             }}
//                             onPress={() => setIsProfileModal(!isProfileModal)}>
//                             <Text style={styles.profileIconText}>
//                                 D{/* {userData.firstName[0].toUpperCase()} */}
//                             </Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             )}
//         </>
//     );

// }

// const styles = StyleSheet.create({
//     mainView: {
//         flex: 1,
//     },
//     deleteContainer: {
//         display: 'flex',
//         width: wp(100),
//         height: hp(100),
//         justifyContent: 'center',
//         alignItems: 'center',
//         position: 'relative',
//         zIndex: 10,
//         backgroundColor: 'rgba(255, 255, 255, 0.5)',
//     },
//     deleteModal: {
//         backgroundColor: 'white',
//         width: wp(60),
//         height: hp(20),
//         zIndex: 10,
//         top: hp(0),
//         left: wp(0),
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     logoutText: {
//         fontFamily: 'RobotoMono-Regular',
//         fontSize: wp(4.5),
//         fontWeight: 'bold',
//     },
//     deleteText: {
//         fontFamily: 'RobotoMono-Regular',
//         fontSize: wp(4.5),
//         fontWeight: 'bold',
//         color: 'red',
//     },
//     headerBar: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: wp(2),
//         backgroundColor: '#ffffff',
//     },
//     profileIcon: {
//         width: wp(8),
//         height: wp(8),
//         borderRadius: wp(50),
//         backgroundColor: 'navy',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     profileIconText: {
//         fontFamily: 'RobotoMono-Regular',
//         color: 'white',
//         fontSize: wp(5),
//     },
//     profileModalView: {
//         backgroundColor: 'white',
//         borderRadius: wp(2),
//         padding: wp(2),
//         shadowColor: '#000000',
//         shadowOffset: {
//             width: wp(0),
//             height: hp(2),
//         },
//         shadowOpacity: wp(0.25),
//         shadowRadius: wp(4),
//         elevation: hp(5),
//         gap: hp(2),
//         justifyContent: 'center',
//         alignItems: 'center',
//         width: wp(30),
//         position: 'absolute',
//         top: hp(6),
//         right: wp(2),
//         zIndex: 4,
//     },
//     modalContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     modalContent: {
//         backgroundColor: '#fff',
//         padding: 20,
//         borderRadius: 10,
//         width: '80%',
//     },
//     modalText1: {
//         fontFamily: 'RobotoMono-Regular',
//         fontSize: 18,
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },
//     deleteButton: {
//         backgroundColor: '#FF5050',
//         paddingVertical: 10,
//         paddingHorizontal: 20,
//         borderRadius: 5,
//         width: '45%',
//         alignItems: 'center',
//     },
//     cancelButton: {
//         backgroundColor: '#4CAF50',
//         paddingVertical: 10,
//         paddingHorizontal: 20,
//         borderRadius: 5,
//         width: '45%',
//         alignItems: 'center',
//     },
//     buttonText: {
//         fontFamily: 'RobotoMono-Regular',
//         color: '#fff',
//         fontSize: 16,
//     },
// });

// export default HomeScreen;