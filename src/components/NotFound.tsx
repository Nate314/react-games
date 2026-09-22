import { Link } from 'react-router-dom';
import { Layout } from './Layout';

export function NotFound() {
    return (
        <Layout>
            <section className="panel">
                <p>{'¯\\_(ツ)_/¯'} NOT FOUND</p>
                <Link to="/">Go back home</Link>
            </section>
        </Layout>
    );
}
