import {Application , Router } from "@oak/oak";


class StoreInKV {
  total_visitor_count:number = 0 
  ip?:string 
}

const kv = await Deno.openKv();
const VISITOR_COUNT:Deno.KvKey = ["counter", "visitor"]

const router = new Router();

router.get("/", async (ctx) => {
  const getCounter = await kv.get<StoreInKV>(VISITOR_COUNT);
  
  if (!getCounter.value) {
    const dataToStore = new StoreInKV();
    dataToStore.ip = ctx.request.ip;
    await kv.set(VISITOR_COUNT,dataToStore)
  } else {
    getCounter.value.ip = ctx.request.ip
    getCounter.value.total_visitor_count += 1; 
    await kv.set(VISITOR_COUNT,getCounter.value)
  }

  console.log(ctx.request.ip);
  console.log(await kv.get(VISITOR_COUNT))


  ctx.response.body = getCounter.value
})


router.get("/total_visitor", async (ctx) => {
  const getCounter = await kv.get<number>(VISITOR_COUNT);
  ctx.response.body = {
    total_visitor: getCounter.value ?? 0
  }
})

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({port:8080});
