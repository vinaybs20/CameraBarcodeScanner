import React, {
    useState,
    Component,
    useEffect
} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Image,

    Dimensions,
    Button,
    ScrollView,
    Seperator,
    TextInput
} from 'react-native';
import {
    RNCamera
} from 'react-native-camera';
import {
    openDatabase
} from 'react-native-sqlite-storage';
import NetInfo from "@react-native-community/netinfo";
var db = openDatabase({
    name: 'db.testDb'
});

export default class BarcodeScan extends Component {
    constructor(props) {
        super(props);
        //this.handleTourch = this.handleTourch.bind(this);

        this.state = {
            torchOn: false,
            data: null,
            CameraPermissionGranted: null,
            cameraOn: false,
            scanned: false,
            showDetails: false,
            barCodeNumber: null,
            locationDetails: null,
            rack: null,
            asset: null,
            connection_Status: "",
            network_type: ""
        }


        db.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, bar_code_number TEXT, location_details TEXT, rack TEXT, asset Text)'
            )
        });

        this.fetchData();



    }

    componentDidMount() {

        NetInfo.addEventListener(state => {
            console.log("Connection type", state.type);
            console.log("Is connected?", state.isConnected);

            this.setState({
                connection_Status: state.isConnected ? 'Connected' : 'not connected',
                network_type: (state.type == 'none') ? 'Any' : state.type
            });
        });

    }




    onBarCodeRead = (e) => {
        alert(`Bar code with type ${e.type} and data ${e.data} has been scanned!`);
        this.setState({
            barCodeNumber: e.data
        });
        this.setState({
            cameraOn: false
        });
    }


	render() {    
	return (
		<View style={styles.container}>

		<Text></Text> 
		<Text></Text> 
		<Text></Text> 
		<View style={styles.MainContainer}>
        <Text style={{fontSize: 20, textAlign: 'center', marginBottom: 20}}> You are { this.state.connection_Status  } to  {this.state.network_type} network. </Text>       
		</View>		   
		{this.state.showDetails && 
			<View>
			<Text>Scanned data</Text> 
			<Button
			title="Click here to go back to Form"
			onPress={() => {this.setState({ showDetails: false });  }}
			/>	
			<ScrollView>
			{
				this.state.data && this.state.data.map(data =>			
				(		
					<View  key={data.id}>						
						<Text >{data.bar_code_number} - {data.rack} - {data.location_details} - {data.asset} </Text>				
					</View>
            )
        )}
        </ScrollView>
		
		</View>
		}
	
		{!this.state.showDetails &&
		<View>
		{
			<View>
			<Text>Enter Location</Text> 
			<TextInput
			style={{ height: 40, borderColor: 'black', borderWidth: 3 }}
			onChangeText={text => {this.setState({ locationDetails: text }); }}     
			/>
			<Text>Enter Rack</Text> 
				<TextInput
				style={{ height: 40, borderColor: 'gray', borderWidth: 3 }}
				onChangeText={text => {this.setState({ rack: text }); }}      
			/>
			<Text>Enter Asset</Text> 
			<TextInput
				style={{ height: 40, borderColor: 'gray', borderWidth: 3 }}
				onChangeText={text => {this.setState({ asset: text }); }}
    
			/>
			</View>
		}
		{!this.state.cameraOn &&
		<Button
			title="Click here to Scan Barcode "
			onPress={() => {this.setState({ cameraOn: true }); }}
		/>}		   
		{this.state.cameraOn &&
		<Button
			title="Close Camera"
			onPress={() => {this.setState({ cameraOn: false }); }}
		/>}
    	{this.state.cameraOn && 	
		<RNCamera
			ref={ref => {
				this.camera = ref;
			}}
			style={{
				flex: 1,
				width: '100%'
			}}
			captureAudio={false}
			androidCameraPermissionOptions={{
				title: 'Permission to use camera',
				message: 'We need your permission to use your camera',
				buttonPositive: 'Ok',
				buttonNegative: 'Cancel',
			}}
			androidRecordAudioPermissionOptions={{
				title: 'Permission to use audio recording',
				message: 'We need your permission to use your audio',
				buttonPositive: 'Ok1',
				buttonNegative: 'Cancel',
			}}
			onBarCodeRead={this.onBarCodeRead}
		>
			<Text style={{
				backgroundColor: 'white'
				}}>BARCODE SCANNER</Text>
		</RNCamera>
     } 
	 <Button
        title="Click here to save scanned details"
        onPress={() => {this.saveFormDetails() }}
		/>
	  <Button
        title="Click here to show scanned details"
        onPress={() => {this.fetchData(); this.setState({ showDetails: true }); }}
		/>
  </View>}
	
</View>
)
}

saveFormDetails = () => {
    this.newItem(this.state.barCodeNumber, this.state.locationDetails, this.state.rack, this.state.asset);
    alert(`Saved item successfully`);

}

fetchData = () => {



    db.transaction(tx => {
        tx.executeSql('select * from items', [],
            (tx, res) => {
                var temp = [];

                for (let i = 0; i < res.rows.length; i++) {
                    temp.push(res.rows.item(i));
                }
                this.setState({
                    data: temp
                });


            });
    });

}


newItem = (barCodeNumber, locationDetails, rack, asset) => {

    db.transaction(tx => {

        tx.executeSql('INSERT INTO items (bar_code_number, location_details, rack, asset) values (?, ?, ?, ?) ', [barCodeNumber, locationDetails, rack, asset],
            (txObj, resultSet) => {
                this.setState({
                    data: this.state.data.concat({
                        id: resultSet.insertId,
                        barCodeNumber: barCodeNumber,
                        locationDetails: locationDetails,
                        rack: rack,
                        asset: asset
                    })
                })
            },
            (txObj, error) => console.log('Error', error))
    })

}

handleTourch(value) {
    if (value === true) {
        this.setState({
            torchOn: false
        });
    } else {
        this.setState({
            torchOn: true
        });
    }
}
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});