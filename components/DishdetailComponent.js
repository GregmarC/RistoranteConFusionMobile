import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, FlatList, CardImg, CardImgOverlay, CardText, CardBody,
    CardTitle, Breadcrumb, BreadcrumbItem, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Label, LocalForm, Control, Errors, Alert, PanResponder } from 'react-native';
import { Card, Icon, Rating, Input, Button } from 'react-native-elements';
import { DISHES } from '../shared/dishes';
import { COMMENTS } from '../shared/comments';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) =>
    dispatch(postComment(dishId, rating, author, comment))
});

function RenderDish(props) {
    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -100 )
            return true;
        else
            return false;
    }

    const recognizeComment = ({ moveX, moveY, dx, dy }) => {
        if ( dx > 100 )
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },

        onPanResponderGrant: () => {this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));},

        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeComment(gestureState))
                props.onSelect();

            else if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );

            return true;

        }
    })

        if (dish != null) {
            return (
                <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
                    ref={this.handleViewRef}
                    {...panResponder.panHandlers}>
                    <Card
                        featuredTitle={dish.name}
                        image={{uri: baseUrl + dish.image}} >
                            <Text style ={{margin: 10}} >
                                {dish.description}
                            </Text>
                                <View style = {{justifyContent : 'center', alignItems: 'center', flexDirection:'row'}}>
                                    <Icon style
                                        raised
                                        reverse
                                        name={ props.favorite ? 'heart' : 'heart-o'}
                                        type='font-awesome'
                                        color='#f50'
                                        onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()} />
                                    <Icon style
                                        raised
                                        reverse
                                        name='pencil'
                                        type='font-awesome'
                                        color='#f50'
                                        onPress={() => props.onSelect()} />
                                </View>
                    </Card>
                </Animatable.View>
            );
        }
        else {
            return (<View></View>);
        }
}

function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating style={{alignSelf: 'flex-start'}}
                    ratingCount={5}
                    startingValue={item.rating}
                    imageSize={10}
                    onFinishRating={null} />
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>     
            <Card title='Comments' >
            <FlatList 
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}


class DishDetail extends Component{

    constructor(props){
        super(props);
        this.state = {
            favorites: [],
            rating: 5, 
            author: '',
            comment: '',
            isModalOpen: false
        };

        this.toggleModal = this
        .toggleModal.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    toggleModal() {
        this.setState({
          isModalOpen: !this.state.isModalOpen
        });
    }

    resetForm() {
        this.setState({
            isModalOpen: false,
            rating: 5,
            author: '',
            comment: '',
        });
    }

    handleSubmit(dishId) {
        const { postComment } = this.props;
        const { author, comment, rating } = this.state;
        postComment(dishId, rating, author, comment);
        this.toggleModal();
        this.resetForm();
      }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    render() {
        const dishId = this.props.navigation.getParam('dishId','');
        return(
            <ScrollView>
                <View >
                    <RenderDish dish={this.props.dishes.dishes[+dishId]}
                        favorite={this.props.favorites.some(el => el === dishId)}
                        onPress={() => this.markFavorite(dishId)} 
                        onSelect={() => this.toggleModal()} />
                    <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                
                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.isModalOpen}
                    onRequestClose = {() => this.toggleModal() }
                    dishId = {dishId}
                    postComment={postComment} >
                    <View style = {styles.modal}>
                    <Text style = {styles.modalTitle}>Please give us your feedback</Text>     
                    <Rating
                        type='star'
                        ratingCount={5}
                        showRating fractions={1}
                        startingValue={0}
                        imageSize={60}
                        showRating
                        onFinishRating={(rating) => this.setState({rating})} />
                    <Input
                        placeholder='     Author'
                        leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                        onChangeText={author => this.setState({ author })} />
                    <Input
                        placeholder='   Comment'
                        leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                        onChangeText={comment => this.setState({ comment })} />
                    <Button 
                        color="#999999"
                        onPress={() => this.handleSubmit(dishId)}
                        title="Submit" 
                        type="clear" />
                    <Button 
                        onPress = {() =>{this.toggleModal(); this.resetForm();}}
                        color="#512DA8"
                        title="Cancel"
                        type="solid" />
                    </View>
                </Modal>
                </View>
            </ScrollView>        
        );
    }
}

const styles = StyleSheet.create({
    formRow: {
      alignItems: 'center',
justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },
    modal: {
        justifyContent: 'center',
        margin: 20
     },
     modalTitle: {
         fontSize: 24,
         fontWeight: 'bold',
         backgroundColor: '#512DA8',
         textAlign: 'center',
         color: 'white',
         marginBottom: 20
     },
     modalText: {
         fontSize: 18,
         margin: 10
     }
});

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);