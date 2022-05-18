import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import axios from "axios";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


function App() {
  
  // Following are the Hooks
   
  const [price,setPrice]=useState('0.00');
  const [pair,setPair]=useState("");
  const [currency,setCurrency]=useState([]);

  const ws=useRef(null);
  const status=useRef(false);

  // Use Effect for fetching the Country Data

  useEffect(()=>{
    ws.current = new WebSocket("wss://ws-feed.pro.coinbase.com");

     axios.get('https://api.pro.coinbase.com/products').then((res)=>{
         let temp=res.data.filter((elem)=>{
           if(elem.quote_currency=='USD'){
              return elem;
           }
         });


         temp=temp.sort((a,b)=>{
           if(a.base_currency>b.base_currency){
            return 1;
           }else if(a.base_currency<b.base_currency){
             return -1;
           }else{
             return 0;
           }    
         });


         setCurrency(temp);
         status.current=true;
     });
  },[]);
 
  // useEffect for getting live-data from the WebSockets-API

  useEffect(()=>{
    if(status.current==false){
      return;
    }

    let submsg={
      type:"subscribe",
      product_ids:[pair],
      channels:["full"]
    }
    
    const msg=JSON.stringify(submsg);
    ws.current.send(msg);
      
    ws.current.onmessage=(e)=>{
       let data=JSON.parse(e.data);
       if(!data.type)
       return;
       console.log(data);
       setdata(data.price,data.time); 
     }
  },[pair]);

  // Throttling for printing the Price after 5 sec

  let status2=false;
  const setdata=(price,time)=>{
    if(status2) return;
    setPrice(price);
    setTime(time);
    status2=true;
    setTimeout(()=>{
      status2=false;
    },5000)
  }
  
  // Function for select tag 

  const handleSelect=(event)=>{
      let unsubmsg={
        type:"unsubscribe",
        product_ids:[pair],
        channels:["full"],
      }

       const  msg=JSON.stringify(unsubmsg);
       ws.current.send(msg);
       
       
         setPair(event.target.value);
  }



  return (
    <div className="App">
      
         <span className='country-name'>Select For Any Country :</span> <FormControl sx={{ m: 1, minWidth: 120 }} size="small">

         <InputLabel id="demo-select-small">Country-Name</InputLabel>
         <Select
              id="select-tag"  
              onChange={handleSelect}
              label="Select for Any Country"
             >
            <MenuItem value="">
              <em>None</em></MenuItem>
              {currency.map((elem)=>{
                 return(
                   <MenuItem value={elem.id}>{elem.display_name}</MenuItem>
                  )
               })}
         </Select>
       </FormControl>

       
        {<h1><span>Current Time  </span>{new Date().toLocaleString()}</h1>}
        {<h1><span>Current Buying Price   $</span>{price?price:"0.00"}</h1>}
        
    </div>
  )
}

export default App;
 

