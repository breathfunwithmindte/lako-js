const fs = require("fs");

module.exports = class DocRender {

  constructor (props)
  {
    this.title = props.title;
    this.description = props.description;
    this.sections = props.sections;
    console.log(this.sections)
  }


  get_html ()
  {
    const html = fs.readFileSync(root + "/index.html").toString();
    const css = fs.readFileSync(root + "/index.css").toString();
    return html
      .replace("%%css%%", `<style>${css}</style>`)
      .replace("%%title%%", this.title)
      .replace("%%description%%", this.description)
      .replace("%%page-content%%", this.#build_sections())
  }

  #build_sections ()
  {
    return `
      ${this.sections.map(s => this.#build_section(s)).join("\n")}
    `;
  }

  #build_section (section)
  {
    return `
      <div class="group-of-routes">
      <div class="group-of-routes-up">
        <h2>Article</h2>
        ${this.#build_routes_card(section.routes)}
      </div>
    `;

  }

  #build_routes_card(routes)
  {
    return `<div class="group-routes-container">
    ${routes.map(i => this.#build_route_card(i)).join("\n")}
  </div>`
  }

  #build_route_card (route) 
  {
    return `
    <div class="route-card ${route.method.toLowerCase()}_method_hover ${route.method.toLowerCase()}_method_border">
    <div class="route-card-title ${route.method.toLowerCase()}_method_border_bottom">
      <div class="route-card-title-left">
        <strong class="method_name ${route.method.toLowerCase()}_method">${route.method}</strong>
        <strong style="margin-right: 1.4rem;">${route.path}</strong>
        <em>${route.description}</em>
      </div>
      <div class="route-card-title-right"> <button>open</button> </div>
    </div>
    <div class="route-card-content">
      ${this.#route_schema(route)}
    </div>
   
  </div>
    `
  }

  #route_schema (route)
  {
    if(!route.schema) {
      return "<p class='padding'>no schema</p>"
    }else {
      return `
      <div class="param-title"><strong>PAth Parameters</strong></div>
      ${this.#path_params(route.schema)}
      <div class="param-title"><strong>Query Parameters</strong></div>
      ${this.#query_params(route.schema)}
      
      <div class="param-title"><strong>Body</strong></div>
      <div class="params-list">
        <div style="display: flex;">
          <strong class="put_method_border" style="padding: 6.9px;">ID: </strong>
          <ul style="margin-left: 5%;">
            <li>string or number</li>
            <li>minimum length = 3</li>
            <li>maximum length = 15</li>
          </ul>
        </div>
      </div>
      `
    }
  }

  #path_params (schema)
  {
    if(schema["params"]) {
      return `
        <div class="params-list">
          <strong class="padding" style="padding: 6.9px;">
            ${schema["params"].map(i => `${i} <span style='font-weight: 100'>&lt; string | number &gt;</span>`).join(", ")}
          </strong>
        </div>
      `
    }else{
      return `<div class="params-list"><strong>NONE</strong></div>`
    }
  }

  #query_params (schema)
  {
    if(schema["query"]) {
      return `
        <div class="params-list">
          ${this.#get_query_params(schema.query)}
        </div>
      `
    }else{
      return `<div class="params-list"><strong>NONE</strong></div>`
    }
  }
  #get_query_params (query) 
  {
    let arr = []
    for (const key in query) {
      if (Object.hasOwnProperty.call(query, key)) {
        arr.push(`
        <div style="display: flex; margin-bottom: 1.4rem">
          <strong style="padding: 6.9px; width: 6.9%">${key}: </strong>
          <ul 
            style="margin-left: 5%; padding-left: 34px; width: 100%; border: 1px solid var(--hover); background: rgba(255, 255, 255, 0.56); list-style: lower-greek">
            ${this.#get_query_params_details(query[key])}
          </ul>
        </div>
        `)
      }
    }
    return arr.join(" ")
  }

  #get_query_params_details (query_param)
  {
    let arr = []
    for (const key in query_param) {
      if (Object.hasOwnProperty.call(query_param, key)) {
        arr.push(`
        <li class="padding">${key}:<span style="font-weight: 693" >${query_param[key]}</span></li>
        `)
      }
    }
    return arr.join(" ")
  }


}