import { Title } from "../components/Title";
import styles from "./Home.module.css";
import Product from "./Product";
// import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import DisplayProducts from "./DisplayProducts";

const Home = () => {
  // const navigate = useNavigate();

  // const product = useSelector((state) => state.product.products);
  const category = useSelector((state) => state.category.category);
  // console.log(product);
  return (
    <div className={styles.home}>
      {/* CATEGORY SECTION */}
      <section className={styles.section}>
        <Title text1="Shop by" text2="Category" />

        <div className={styles.grid}>
          {category.map((cat) => (
            <Product key={cat.id} item={cat} />
          ))}
        </div>
      </section>

      {/* PRODUCT SECTION */}
      {/* <section className={styles.section}>
        <Title text1="Popular" text2="Products" />

        <div className={styles.grid}>
          {product.map((item) => (
            <DisplayProducts key={item._id} item={item} />
          ))}
        </div>
      </section> */}
    </div>
  );
};

export default Home;
