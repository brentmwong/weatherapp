import React, {useContext, useState} from 'react'
import './App.css'
import {Input, Button} from 'antd'
import {Bar} from 'react-chartjs-2'
import * as moment from 'moment'
const ButtonGroup = Button.Group;

const context = React.createContext()

function App() {
  const [state, setState] = useState({
    searchTerm:'',
    mode:'hourly',
  })
  return <context.Provider value={{
    ...state,
    set: v=> setState({...state, ...v})
  }}>
    <div className="App">
      <Header />
      <Body />
    </div>
  </context.Provider>
}

function Header(){
  const ctx = useContext(context)
  const {loading, searchTerm, mode} = ctx
  return <header className="App-header">
    <Input 
      value={ctx.searchTerm} disabled={loading}
      onChange={e=> ctx.set({searchTerm: e.target.value})}
      style={{height:'3rem',fontSize:'2rem'}} 
      onKeyPress={e=>{
        if(e.key==='Enter' && ctx.searchTerm) search(ctx)
      }}
    />
    <Button style={{marginLeft:5,height:'3rem'}}
      onClick={()=> search(ctx)} type="primary"
      disabled={!searchTerm} loading={loading}>
      Search
    </Button>
    <ButtonGroup style={{marginLeft:'5px', display:'flex'}}>
      <Button style={{height:'3rem'}} type={mode==='hourly'?'primary':'deafult'}
      onClick={()=>ctx.set({mode:'hourly'})}>Hourly</Button>
      <Button style={{height:'3rem'}} type={mode==='daily'?'primary':'deafult'}
      onClick={()=>ctx.set({mode:'daily'})}>Daily</Button>
    </ButtonGroup>
  </header>
}

function Body(){
  const ctx = useContext(context)
  const {error, weather, mode} = ctx
  let data
  if(weather){
    console.log(weather)
    data = {
      labels: weather[mode].data.map(d=>moment(d.time*1000).format('dd hh:mm')),
      datasets: [{
        label:'Temperature',
        data: weather[mode].data.map(d=>{
          if(mode==='hourly') return d.temperature
          else return (d.temperatureHigh+d.temperatureLow)/2
        }),
        backgroundColor:'rgb(255, 155 , 155)',
        borderColor:'rgb(255, 155 , 155)',
      }]
    }
  }
  console.log(data)
  return <div className="App-body">
    {error && <div className="error">{error}</div>}
    {data && <div>
      <Bar data={data}
        width={800} height={400}
      />
    </div>}
  </div>
}

async function search({searchTerm, set}){
  try {
    const term = searchTerm
    set({error:'', loading:true})

    const osmurl = `https://nominatim.openstreetmap.org/search/${term}?format=json`
    const r = await fetch(osmurl)
    const loc = await r.json()
    if(!loc[0]){
      return set({error:'No city matching that query'})
    }
    const city = loc[0]

    const key = '45236e8510745ee86684a5946eda8cda'
    const url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${key}/${city.lat},${city.lon}`
    const r2 = await fetch(url)
    const weather = await r2.json()
    set({weather, loading:false, searchTerm:''})
  } catch(e) {
    set({error: e.message})
  }
}

export default App;