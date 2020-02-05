import React, {useContext, useState} from 'react';
import './App.css';
import {Input, Button} from 'antd'

const context = React.createContext()

function App() {
  const [state, setState] = useState({
    searchTerm:''
  })
  return <context.Provider value={{
    ...state,
    set: v=> setState({...state, ...v})

}}>
    <div className="App">
      <Header/>
      {state.error && <div>{state.error}</div>}
    </div>
  </context.Provider>
}

function Header(){
  const ctx = useContext(context)

  return <header className="App-header">
    <Input 
      value={ctx.searchTerm} 
      onChange={e => ctx.set({searchTerm: e.target.value})} 
      style={{height:'3rem', fontSize:'2rem'}}
      onKeyPress={e=>{
        if(e.key==='Enter' && ctx.searchTerm) search(ctx)
      }}
    />
    <Button 
      onClick={()=> search(ctx)} type="primary"
      disabled={!ctx.searchTerm}
      style={{height:'3rem', marginLeft:5}}>
      Search
    </Button>
</header>
}

async function search({searchTerm, set}){
  const term = searchTerm
  set({searchTerm:'', error:''})

  const osmurl = `https://nominatim.openstreetmap.org/search/${searchTerm}?format=json`
  const r = await fetch(osmurl)
  const loc = await r.json
  if(!loc[0]){
    return set({error: 'No city matching that query'})
  }
  const city = loc[0]

  const key ='27cee7d71c9d16dc308e9909d62fe773'
  const url = `https://api.darksky.net/forecast/${key}/${city.lat},${city.lon}`
  const r2 = await fetch(url)
  const weather = await r2.json()
}

export default App;
