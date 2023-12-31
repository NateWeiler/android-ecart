

import React, { Component } from 'react';
import { View, Text, StyleSheet,ScrollView,TouchableOpacity,Dimensions,RefreshControl } from 'react-native';
import Product from "./components/Product_wishlist";
import Wrapper from './Wrapper';

import {connect} from "react-redux";
import Loader from '../major_components/Loader';
import EmptyItems from '../major_components/EmptyItems';
import { showMessage } from 'react-native-flash-message';
import Axios from 'axios';
 
import {Snackbar,Portal,Provider} from 'react-native-paper';


class WishList extends Component {
    constructor(props){
        super(props);
        this.state={
            refresh:false,
            snackbar:false,
            snackMessage:""
        }
        this.loadWishlist = this.loadWishlist.bind(this);
    }
  loadWishlist(){
      Axios.get("/wish_list",{headers:{"AUTH-TOKEN": this.props.AUTH_TOKEN}})
      .then(({data}) => {
           if (data.success == true) {
               let products = data.products;
               this.props.toggleLoading();
               this.props.loadWishlist(products);
           }
           this.setState({
               loading: false,
               refresh:false
           });
           this.props.toggleLoading();
       }).catch(err => console.error(err));
  }
    componentWillMount(){
        if (this.props.AUTH_TOKEN == "") {
            showMessage({
                description: "Login To Use Full Features",
                message: "Login Required",
                type: "danger"
            });
            this.props.navigation.navigate('Login');
        }else{
           this.loadWishlist();
        }
    }
   openProductPage(id){
       this.props.navigation.navigate('ExploreProduct',{id})
   }

    removeItem(id){ 
        obj={
            product_id:id 
        };
        Axios.delete("/remove_item_from_wish_list",{data:obj,headers:{"AUTH-TOKEN":this.props.AUTH_TOKEN }})
        .then(({data})=>{
            if(data.success==true){
                this.props.removeFromWishlist(id);
                this.props.changeCurrent(id,{isinWishlist:false});
            }
        }).catch(err=>console.log(err)).finally(()=>{
             this.setState({
                 snackMessage:"product removed from wishlist"
             });
        }) 
    }
    onRefresh(){
        this.setState({
            refresh:true
        });
        this.loadWishlist();

    }
    render() {
        Items=[];
        this.props.wishlistItems.forEach((item,i)=>{
            Items.push(
                <Product key={i} onClick={this.openProductPage.bind(this)} productdata={item} onRemove={this.removeItem.bind(this)} />
            );   
        })  
        return (
         this.props.loading?<Loader/>:
            Items.length>0?
            <Wrapper noBackground>
                    <View style={{flex:1}}>
                        <ScrollView style={{flex:1,paddingBottom:35}}
                          refreshControl={
                             <RefreshControl refreshing={this.state.refresh} onRefresh={this.onRefresh.bind(this)}/>}
                        >
                            {(()=>Items)()}
                        </ScrollView> 
                    </View>
                    <Snackbar 
                        visible={this.state.snackbar}
                        onDismiss={()=>this.setState({snackbar:false})}
                        >
                        {this.state.snackMessage}
                    </Snackbar>
            </Wrapper>:
            <EmptyItems message="Wishlist is Empty!"/>
        )    
            
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ecf0f1',
        
    },
 
    btn:{
        backgroundColor:"#27ae60",
        justifyContent:"center",
        paddingTop:5,
        paddingBottom:5,
        paddingLeft:40,
        paddingRight:40,
        borderRadius:5,   
    }
});
mapStatetoProps=state=>{
    let {Wishlist}=state;
    return {
        wishlistItems:Wishlist.items,
        loading:Wishlist.loading,
        baseUrl: state.Config.base_url,
        AUTH_TOKEN: state.Config.AUTH_TOKEN
    }
}
mapDispatch=dispatch=>{
    return{
        removeFromWishlist:(id)=>{dispatch({type:"REMOVE_FROM_WISHLIST",id})},
        loadWishlist:(products)=>{dispatch({type:"LOAD_WISHLIST",products})},
        toggleLoading:()=>{dispatch({type:"TOGGLE_WISHLIST_LOADING"})},
        changeWishlistStatus:(id,value)=>{dispatch({type:"MODIFY_ITEM_WISHLIST_STATUS",id,value})},
        changeWishlistStatus_Result:(id,value)=>{dispatch({type:"MODIFY_SEARCH_ITEM_WISHLIST_STATUS",id,value})},
        changeCurrent:(id,obj)=>{dispatch({type:"CHANGE_CURRENT_ITEM_STATUS",id,obj})}
    }
}

export default connect(mapStatetoProps,mapDispatch)(WishList);


