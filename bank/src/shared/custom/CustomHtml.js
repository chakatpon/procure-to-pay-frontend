import _, { get,set, isEmpty, forEach, filter } from "lodash";

const amountFormat = (text) => {
  text = parseFloat(text);
  if(Number.isNaN(text)){
    return "";
  }
  text = text.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  return text ? text : "";
}

const CustomHtml = ({ model, data }) => {
  const regexp = /\$\{([.\[\]\|\w]+)\}/gm;
  var html = get(model,'html','');
  const array = [...html.matchAll(regexp)];
  array.forEach(r => {
    let key = get(r,"1").split("|");
    let v = get(data,get(key,"0"));
    if(key.length > 1){
      for(let x=1;x<key.length;x++){
        v = eval(get(key,x) + "(" + v + ")")
      }
    }
    html = html.replace(get(r,"0"),v);

  })

  return <div dangerouslySetInnerHTML={{__html : html}}></div>;
}
export default CustomHtml;
