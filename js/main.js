import {Router} from "./router.js"

const router = new Router()
router.add("/","pages/home.html")
router.add("/universe","/pages/universe.html")
router.add("/explore","/pages/explore.html")

router.handle()

window.addEventListener(`popstate`, () => {
    router.handle()
})

window.route = () => {
    router.route()
}