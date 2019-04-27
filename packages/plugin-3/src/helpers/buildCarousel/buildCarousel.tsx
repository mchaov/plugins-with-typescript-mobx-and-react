import * as React from "react";
import { Carousel } from "react-responsive-carousel";

// ignored from coverage as it is hard coded use of third party lib
/* istanbul ignore next */
export class BuildCarousel extends React.Component<{}, {}>{
    render() {
        return (
            <>
                <h2>React Carousel!</h2>
                <Carousel showArrows={true} /* onChange={onChange} onClickItem={onClickItem} onClickThumb={onClickThumb}*/>
                    <div key="1">
                        <img src="https://picsum.photos/1280/960" />
                        <p className="legend">Legend 1</p>
                    </div>
                    <div key="2">
                        <img src="https://placeimg.com/640/480/any" />
                        <p className="legend">Legend 6</p>
                    </div>
                    <div key="3">
                        <img src="http://lorempixel.com/1200/960" />
                        <p className="legend">Legend 3</p>
                    </div>
                    <div key="4">
                        <img src="https://picsum.photos/id/239/1000/960" />
                        <p className="legend">Legend 4</p>
                    </div>
                    <div key="5">
                        <img src="https://source.unsplash.com/random/800x600" />
                        <p className="legend">Legend 5</p>
                    </div>
                    <div key="6">
                        <img src="/third-party/imgs/placeholder.png" />
                        <p className="legend">Legend 6</p>
                    </div>
                </Carousel>
            </>
        );
    }
}